import { parse } from 'papaparse';
import { readonly, ref, reactive } from 'vue';

interface Region {
  code: string;
  parentCode?: string;
  childrenCodes?: string[];
  type: string;
  level: number;
  prefix: string;
  name: string;
}

interface CsvRow {
  code: string;
  level: string;
  type: string;
  localPrefix: string;
  name: string;
}
const regionMap = reactive(new Map<string, Region>());

const isLoading = ref<boolean>(false);
let isLoaded = false;

function loadRegion(region: Region) {
  region.childrenCodes = reactive([]);

  let parentCodeLength = 0;
  if (region.level === 2)
    parentCodeLength = 2;
  else if (region.level === 3)
    parentCodeLength = 5;
  else if (region.level === 4)
    parentCodeLength = 8;

  if (parentCodeLength)
    region.parentCode = region.code.substr(0, parentCodeLength);
  else
    region.parentCode = undefined;

  regionMap.set(region.code, reactive(region));

  if (region.parentCode) {
    regionMap.get(region.parentCode)?.childrenCodes?.push(region.code);
  }
}

export async function loadCsv() {
  const res = await fetch('/data/dagri2017.csv');
  const text = await res.text();
  return new Promise<void>((resolve, reject) => {
    parse<CsvRow>(text, {
      header: true,
      step: (row) => {
        if (row.errors.length > 0) {
          reject(row.errors);
        }

        const data: CsvRow = row.data as any;
        if (!data) console.dir(row);
        loadRegion({
          code: data.code,
          level: parseInt(data.level),
          type: data.type,
          prefix: data.localPrefix,
          name: data.name,
        });
      },
      complete: () => resolve()
    });
  })
}

function findRegion(code: string | undefined): Region {
  if (code) {
    const region = regionMap.get(code);
    if (region) {
      return region;
    }
  }

  return {
    code: '',
    level: 1,
    name: '',
    prefix: '',
    type: ''
  }
}

export function useDagriData() {
  if (!isLoaded) {
    isLoading.value = true;
    loadCsv().then(() => {
      isLoading.value = false;
      isLoaded = true;
    });
  }

  return {
    isLoading,
    regionMap: readonly(regionMap),
    findRegion
  };
}

export function useRegionMap() {
  return regionMap;
}
