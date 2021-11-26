import { getLevel, getParentCode, getPrefix, sanitizeName } from './dagri';
import { LoadableArray } from './loadable';

interface IRegionStore {
  getRegionName(code: string): string;
  getRegionChildren(parentCode: string): Region[] | undefined;
  getRegion(code: string): Region;
  loadRegion(code: string): Promise<string | undefined>;
  loadRegionChildren(parentCode: string): Promise<Region[] | undefined>;
}
export class Region {
  _code = '';
  _name = '';
  store: IRegionStore;
  loading = false;
  loaded = false;

  children: LoadableArray<Region> | null = null;

  constructor(store: IRegionStore, withChildren = false) {
    this.store = store;

    if (withChildren) {
      this.children = new LoadableArray();
    }
  }

  async load(code: string) {
    this._code = code;

    const name = this.store.getRegionName(code);
    if (name) {
      this._name = name;
      this.loading = false;
      this.loaded = true;
    } else {
      this.loading = true;
      this.loaded = false;
      this._name = await this.store.loadRegion(code) || '';
      this.loading = false;
      this.loaded = true;
    }

    this.loading = false;
    this.loaded = true;

    if (this.children) {
      const childRegions = this.store.getRegionChildren(this._code);
      if (childRegions) {
        this.children.load(childRegions);
      } else {
        this.children.load(this.store.loadRegionChildren(this._code));
      }
    }
  }

  get code(): string {
    return this._code;
  }

  get name(): string {
    return sanitizeName(this._name, this._code);
  }

  get level(): number {
    return getLevel(this._code);
  }

  get prefix(): string {
    return getPrefix(this._code);
  }

  get parentCode(): string | null {
    if (this.level > 1) {
      return getParentCode(this._code);
    } else {
      return null;
    }
  }

  get parent(): Region | null {
    if (this.parentCode) {
      return this.store.getRegion(this.parentCode);
    } else {
      return null;
    }
  }
}
