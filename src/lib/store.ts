import { defineStore } from 'pinia'
import { reactive, watchEffect } from 'vue'
import { getLevel, getParentCode } from './dagri'
import { Region } from './region'
import { LoadableArray } from './loadable'

export const useStore = defineStore('kodewilayah', {
  state: () => {
    return {
      codeToName: new Map<string, string>(),
      codeToChildren: new Map<string, Set<string>>(),
      fetchedBasenames: new Set<string>()
    }
  },
  actions: {
    // Add a region to the cache
    addRegion(code: string, name: string) {
      // Register the name
      this.codeToName.set(code, name)

      // Register as a child of its parent
      const parentCode = getParentCode(code)
      if (parentCode) {
        if (!this.codeToChildren.get(parentCode)) {
          this.codeToChildren.set(parentCode, new Set())
        }

        this.codeToChildren.get(parentCode)?.add(code)
      }
    },

    parseFile(text: string) {
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
            code = previousCode2 + '.' + code.substring(1);
            previousCode3 = code;
          }
        }
        else if (code.length === 4) { // L4
          code = previousCode3 + '.' + code
        }
    
        this.addRegion(code, name)
      }
    },

    async fetchBasenameIfNotFetched(basename: string): Promise<void> {
      if (this.fetchedBasenames.has(basename)) {
        return
      }

      const res = await fetch('/data/dagri2019/' + basename + '.tsv');
      const text = await res.text();

      this.parseFile(text)

      this.fetchedBasenames.add(basename)
    },

    // Synchronously get the name of a region from the cache
    getRegionName(code: string): string {
      return this.codeToName.get(code) || ''
    },

    // Synchronously get the children of a region from the cache
    getRegionChildren(parentCode: string): Region[] | undefined {
      const resolvedChildren = this.codeToChildren.get(parentCode)
      if (!resolvedChildren) {
        return undefined
      }

      const childRegions = [...resolvedChildren].map(code => this.getRegion(code))
      return childRegions
    },

    // Generate an object representation of a region given a code
    getRegion(code: string): Region {
      const region = reactive(new Region(this))
      region.load(code)
      return region
    },

    async loadRegion(code: string): Promise<string | undefined> {
      const level = getLevel(code)
      let basename = 'root'
      if (level > 2) {
        basename = code.substring(0, 2)
      }

      await this.fetchBasenameIfNotFetched(basename)

      return this.getRegionName(code)
    },

    async loadRegionChildren(parentCode: string): Promise<Region[] | undefined> {
      const level = getLevel(parentCode)
      let basename = 'root'
      if (level >= 2) {
        basename = parentCode.substring(0, 2)
      }

      await this.fetchBasenameIfNotFetched(basename)

      return this.getRegionChildren(parentCode)
    },

    useRegion(getCode: () => string | undefined): Region & { children: LoadableArray<Region> } {
      const region = reactive(new Region(this, true)) as (Region & { children: LoadableArray<Region> })

      watchEffect(async () => {
        const code = getCode() || ''
        region.load(code)

        // Prefetch a Province's index
        if (getLevel(code) === 1) {
          this.fetchBasenameIfNotFetched(code)
        }
      })

      return region
    }
  }
})
