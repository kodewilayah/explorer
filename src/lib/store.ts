// The store where we keep region data in minimal format

import { reactive } from "vue";
import { getLevel, getParentCode } from "./dagri";
import type { LoadingStateSetter } from './loadable'

export const codeToName = reactive(new Map<string, string>());
export const codeToChildren = reactive(new Map<string, Set<string>>());
export const loadedSet = reactive(new Set<string>());

const state = reactive({ isLoaded: false });

function loadRegion(code: string, name: string) {
  codeToName.set(code, name);

  const parentCode = getParentCode(code);
  if (parentCode) {
    if (!codeToChildren.get(parentCode)) {
      codeToChildren.set(parentCode, new Set());
    }

    codeToChildren.get(parentCode)?.add(code)
  }
}

async function loadCsv(variant: string = 'root') {
  const res = await fetch('/data/dagri2019/' + variant + '.tsv');
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
  const level = getLevel(code);
  let variant = 'root'
  if (level > 2) {
    variant = code.substr(0, 2);
  }

  if (loadedSet.has(variant)) {
    setLoadingState(false, true);
    return;
  }

  setLoadingState(true, false);
  await loadCsv(variant);
  setLoadingState(false, true);
  loadedSet.add(variant);
}

export async function fetchRegionChildren(parentCode: string, setLoadingState: LoadingStateSetter = () => {}) {
  const level = getLevel(parentCode);
  let variant = 'root'
  if (level > 1) {
    variant = parentCode.substr(0, 2);
  }

  if (loadedSet.has(variant)) {
    setLoadingState(false, true);
    return;
  }

  setLoadingState(true, false);
  await loadCsv(variant);
  setLoadingState(false, true);
  loadedSet.add(variant);
}
