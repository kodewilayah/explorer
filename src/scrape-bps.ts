import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { appendFile } from 'fs/promises';

// Initial scope:
// 1. Latest BPS data only (2018H1)
// 2. Up until kelurahan/desa level
// 3. Store BPS as its own independent dataset
// 4. ...with separate file(s) for bridging

// Next step: try bridging to postcode via BPS
// After that: historical BPS data/names; useful as alternative spellings

type BpsUnit = {
  kode_bps: string,
  nama_bps: string,
  kode_dagri: string,
  nama_dagri: string
};

type BpsResponse = BpsUnit[];

const host = 'https://sig-dev.bps.go.id';
const rootUrl = `${host}/restBridging/getwilayah/level/provinsi/parent/0`

const bpsCodeToName = new Map<string, string>();
const dagriCodeToName = new Map<string, string>();
const bpsCodeToDagriCode = new Map<string, string>();
const bpsCodeToFetchResponse = new Map<string, BpsResponse | Error>();

function makeUrl(
  level: 'kabupaten' | 'kecamatan' | 'desa',
  parentCode: number | string,
  edition: string = '20181'
) {
  return `${host}/restBridging/getwilayahperiode/level/${level}/parent/${parentCode}/periode/${edition}`
}

const fetchQueue = new PQueue({ concurrency: 10 });

async function parseUnit(unit: BpsUnit) {
  const { kode_bps, nama_bps, kode_dagri, nama_dagri } = unit;
  bpsCodeToName.set(kode_bps, nama_bps);
  if (kode_dagri) {
    dagriCodeToName.set(kode_dagri, nama_dagri);
    bpsCodeToDagriCode.set(kode_bps, kode_dagri);
  }

  await appendFile('./data/bps/bps-20181.tsv', `${kode_bps}\t${nama_bps}\n`);
  await appendFile('./data/bps/dagri.tsv', `${kode_dagri}\t${nama_dagri}\n`);
  await appendFile('./data/bps/bps-to-dagri.tsv', `${kode_bps}\t${kode_dagri}\n`);
}

async function parseResponse(data: BpsResponse) {
  // add each code to queue
  for (let unit of data) {
    fetchQueue.add(() => fetchBpsChildren(unit.kode_bps));
  }
  // in parallel, we parse the unit including making csv files
  for (let unit of data) {
    await parseUnit(unit);
  }
}

async function fetchBpsChildren(parentCode: string) {
  let level: 'kabupaten' | 'kecamatan' | 'desa' = 'kabupaten';
  if (parentCode.length === 4) level = 'kecamatan';
  else if (parentCode.length === 7) level = 'desa';
  else if (parentCode.length > 7) return;

  const url = makeUrl(level, parentCode);

  try {
    // console.error(`Fetching ${level} under ${parentCode}`);
    const response = await fetch(url);
    if (response.ok) {
      try {
        const responseJson = await response.json();
        bpsCodeToFetchResponse.set(parentCode, responseJson);
        parseResponse(responseJson);
      } catch (e) {
        const txt = await response.text();
        console.error(txt);
        process.exit();
      }
    } else {
      console.error(url);
    }
  } catch (e) {
    console.error(e);
    process.exit();
    bpsCodeToFetchResponse.set(parentCode, e);
  }
}

async function main() {
  const response = await fetch(rootUrl);
  const responseJson = await response.json();
  parseResponse(responseJson);

  setTimeout(async () => {
    await fetchQueue.onIdle();
    // console.dir(bpsCodeToFetchResponse);
    console.dir(bpsCodeToFetchResponse.size);
  }, 1000)
}

main();