// Region objects and accessors

import { reactive, watchEffect } from 'vue';
import type { UnwrapRef } from 'vue';
import { getParentCode } from './dagri';
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
    const level = this.level;
    let name = this._name;
    name = name.replace(/Kep\./ig, 'Kepulauan');
    name = name.replaceAll('"', '\'');
    const level1Code = this.code.substr(0, 2);
    if (level === 4) {
      if (level1Code === '11') { // Aceh
        if (name.startsWith('Gampong')) {
          name = name.replace(/^Gampong /, '');
        }
        name = name.replace(/Kp(\.|\.? )/ig, 'Kampong ');
        name = name.replace(/Tgk(\.|\.? )/ig, 'Teungku ');
        name = name.replace(/Mns(\.|\.? )/ig, 'Meunasah ');
        name = name.replace(/^Meuna\./, 'Meunasah');
        name = name.replace(/^Mesj\./, 'Mesjid');
      } else if (level1Code === '12') { // Sumatera Barat
        name = name.replace('J.', 'Janji');
      } else if (level1Code === '16') { // Sumatera Selatan
        name = name.replace(/Lb\.? /, 'Lubuk ');
      }

      // Fix abbreviations/mal-abbreviations
      name = name.replace('Sei.', 'Sei');
      name = name.replace(/^Perk\./, 'Perkebunan');
      name = name.replace(/Tj\.? /, 'Tanjung ');
  
      name = name.replace(/ D\.? /, ' D-');
    }
  
    name = name.replace(/^Gn\.? /, 'Gunung ');
    name = name.replace(/\s+/g, ' ');
    name = name.replace(/ *\/ */g, '/');

    return name;
  }

  get parentCode(): string {
    return getParentCode(this._code);
  }

  get level(): number {
    const len = this.code.length;
    if (len === 2)
      return 1;
    else if (len === 5)
      return 2;
    else if (len === 8)
      return 3;
    else if (len === 13)
      return 4;
    else
      return NaN;
  }

  get prefix(): string {
    const level = this.level;
    const code = this.code;
    const level1Code = code.substr(0, 2);

    if (level === 1) {
      return 'Provinsi';
    }
    else if (level === 2) {
      if (level1Code === '31') { // DKI Jakarta
        if (code === '31.01') {
          return 'Kabupaten Administrasi';
        } else {
          return 'Kota Administrasi';
        }
      } else {
        if (parseInt(code[3]) < 7) {
          return 'Kabupaten';
        } else {
          return 'Kota';
        }
      }
    }
    else if (level === 3) {
      if (level1Code === '91' || level1Code === '92') {
        // Papua & Papua Barat use Distrik instead of Kecamatan
        return 'Distrik';
      } else if (level1Code === '34') {
        // Yogyakarta uses Kapanewon & Kemantren
        if (code[3] === '7') { // Kota
          return 'Kemantren';
        } else {
          return 'Kapanewon'
        }
      }
      
      return 'Kecamatan';
    }
    else if (level === 4) {
      const level2Code = code.substr(0, 5);
      if (code[9] === '1') {
        return 'Kelurahan';
      } else {
        if (level1Code === '11') { // Aceh
          return 'Gampong';
        } else if (level1Code === '13') { // Sumatera Barat
          return 'Nagari';
        } else if (level1Code === '34') { // Yogyakarta
          return 'Kalurahan';
        } else if (level1Code === '81' || level1Code === '82') { // Maluku/Maluku Utara
          return 'Negeri';
        } else if (level1Code === '91' || level1Code === '92') { // Papua
          return 'Kampung';
        } else if (level2Code === '15.08') { // Kab. Bungo, Jambi
          return 'Dusun';
        } else if (level2Code === '18.12') { // Kab. Tulang Bawang Barat, Lampung
          return 'Tiyuh';
        } else if ([
          '64.03', '64.07', '64.11', // Kalimantan Timur
          '18.02', '18.05', '18.12', '18.11', '18.08', // Lampung
        ].includes(level2Code)) { // Kalimantan Timur
          return 'Kampung';
        } else if ([
          '18.06', '18.10', '18.04', '18.13' // Lampung
        ].includes(level2Code)) { // Kalimantan Timur
          return 'Pekon';
        }

        return 'Desa';
      }
    }

    return '';
  }
}

export class ExpandedRegion extends Region {
  _parent = new Region();
  _children = new LoadableArray<Region>();

  get children() {
    return this._children;
  }

  setChildren(children: Region[] | undefined | null) {
    this._children.splice(0);
    if (children) {
      this._children.push(...children);
    } else {

    }
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
    if (region.code === code) {
      return;
    }

    // load the Region itself
    await region.load(async () => {
      await fetchRegion(code);
      const name = codeToName.get(code) || '';

      return [code, name];
    });

    const parentCode = region.parentCode;
    if (parentCode) {
      region.loadParent(async () => {
        await fetchRegion(parentCode);
        const parentName = codeToName.get(parentCode) || '';
        return [parentCode, parentName]
      })
    } else {
      region.setParentSource('', '');
    }

    await region.children.load(async () => {
      await fetchRegionChildren(code);

      const childrenCodes = codeToChildren.get(code);
      if (childrenCodes) {
        return childrenCodes.map((code) => {
          const name = codeToName.get(code);
          return new Region(code, name);
        });
      } else {
        return [];
      }
    });
  })

  return region;
}
