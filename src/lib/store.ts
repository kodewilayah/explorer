// The store where we keep region data in minimal format

import { reactive } from "vue";
import { getParentCode } from "./dagri";
import type { LoadingStateSetter } from './loadable'

export const codeToName = reactive(new Map<string, string>());
export const codeToChildren = reactive(new Map<string, string[]>());

const state = reactive({ isLoaded: false });

function loadRegion(code: string, name: string) {
  codeToName.set(code, name);

  const parentCode = getParentCode(code);
  if (parentCode) {
    if (!codeToChildren.get(parentCode)) {
      codeToChildren.set(parentCode, []);
    }

    codeToChildren.get(parentCode)?.push(code)
  }
}

async function loadCsv() {
  const res = await fetch('/data/dagri2019-sparse.tsv');
  const text = await res.text();

  let previousCode1 = '';
  let previousCode2 = '';
  let previousCode3 = '';

  for (const line of text.split('\n')) {
    let [code, name] = line.split('\t')

    // construct the full code
    if (code.length === 2) { // provinsi
      previousCode1 = code
      previousCode2 = ''
      previousCode3 = ''
    }
    else if (code.length === 3) {
      if (code[0] === '.') { // kab/kota
        code = previousCode1 + code;
        previousCode2 = code;
        previousCode3 = '';
      }
      else if (code[0] === ':') { // kecamatan
        code = previousCode2 + '.' + code.substr(1);
        previousCode3 = code;
      }
    }
    else if (code.length === 4) { // L4
      code = previousCode3 + '.' + code
    }

    loadRegion(code, name);
  }
}

export async function fetchRegion(code: string, setLoadingState: LoadingStateSetter = () => {}): Promise<void> {
  if (state.isLoaded) {
    setLoadingState(false, true);
    return;
  }

  setLoadingState(true, false);
  await loadCsv();
  setLoadingState(false, true);
  state.isLoaded = true;
}

export async function fetchRegionChildren(parentCode: string, setLoadingState: LoadingStateSetter = () => {}) {
  return fetchRegion(parentCode, setLoadingState)
}
