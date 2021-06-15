import { ref, reactive, watchEffect } from 'vue';
import type { UnwrapRef } from 'vue';
import { Region, getParentCode, ExpandedRegion } from './lib/region';
import type { IRegion } from './lib/region';

export const codeToName = reactive(new Map<string, string>());
export const codeToChildren = reactive(new Map<string, string[]>());

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

export function useDagriData() {
  const state = reactive({
    isLoading: false,
    isLoaded: false
  });
  if (!state.isLoaded) {
    state.isLoading = true;
    loadCsv().then(() => {
      state.isLoading = false;
      state.isLoaded = true;
    });
  }

  return state;
}

export function useRegion(getCode: () => string | undefined): UnwrapRef<ExpandedRegion> {
  const region = reactive(new ExpandedRegion());

  watchEffect(() => {
    const code = getCode() || '';
    const name = codeToName.get(code) || '';
    region.setSource(code, name);

    const parentCode = region.parentCode;
    const parentName = codeToName.get(parentCode);
    region.setParentSource(parentCode, parentName);

    const childrenCodes = codeToChildren.get(code);
    console.dir(childrenCodes);
    if (childrenCodes) {
      region.setChildren(childrenCodes.map((code) => {
        const name = codeToName.get(code);
        return new Region(code, name);
      }))
    } else {
      region.setChildren(null);
    }
  })

  return region;
}
