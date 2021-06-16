// Region objects and accessors

import { reactive, watchEffect } from 'vue';
import type { UnwrapRef } from 'vue';
import { getLevel, getParentCode, getPrefix, sanitizeName } from './dagri';
import { codeToChildren, codeToName, fetchRegion, fetchRegionChildren } from './store';
import { LoadableArray, Loader, resolveLoader } from './loadable';

export { getParentCode } from './dagri';

export class Region {
  _code = '';
  _name = '';
  loading = false;
  loaded = false;

  constructor(code: string = '', name: string = '') {
    this.setSource(code, name);
  }

  setSource(code: string, name: string) {
    this._code = code;
    this._name = name;
    this.loaded = true;
  }

  async load(loader: Loader<[string, string]>) {
    const [code, name] = await resolveLoader(loader, (loading, loaded) => {
      this.loading = loading;
      this.loaded = loaded;
    });

    this.setSource(code, name);
  }

  get code(): string {
    return this._code;
  }

  get name(): string {
    return sanitizeName(this._name, this._code);
  }

  get parentCode(): string {
    return getParentCode(this._code);
  }

  get level(): number {
    return getLevel(this._code);
  }

  get prefix(): string {
    return getPrefix(this._code)
  }
}

export class ExpandedRegion extends Region {
  _parent = reactive(new Region());
  _children = reactive(new LoadableArray<Region>());

  get children() {
    return this._children;
  }

  get parent() {
    if (this._parent._code) {
      return this._parent;
    }

    return null;
  }

  setParentSource(code: string = '', name: string = '') {
    this._parent.setSource(code, name);
  }

  async loadParent(loader: Loader<[string, string]>) {
    this._parent.load(loader);
  }
}

export function useRegion(getCode: () => string | undefined): UnwrapRef<ExpandedRegion> {
  const region = reactive(new ExpandedRegion());

  watchEffect(async () => {
    const code = getCode() || '';

    // load the Region itself
    await region.load(async () => {
      await fetchRegion(code);
      const name = codeToName.get(code) || '';

      return [code, name];
    });

    const parentCode = region.parentCode;
    if (parentCode) {
      await region.loadParent(async () => {
        await fetchRegion(parentCode);
        const parentName = codeToName.get(parentCode) || '';
        return [parentCode, parentName]
      })
    } else {
      region.setParentSource('', '');
    }

    if (region.level < 4) {
      await region.children.load(async () => {
        await fetchRegionChildren(code);
        const childrenCodes = codeToChildren.get(code) || [];
        if (childrenCodes) {
          const children: Region[] = [];
          for (const code of childrenCodes) {
            const name = codeToName.get(code);
            children.push(new Region(code, name));
          }
          return children;
        }

        return [];
      });
    } else {
      region.children.purge();
    }
  })

  return region;
}
