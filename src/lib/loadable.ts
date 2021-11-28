type Loader<T> = Promise<Iterable<T> | undefined> | Iterable<T> | undefined

export class LoadableArray<T> extends Array<T> {
  loading = false;
  loaded = false;

  constructor(source?: Loader<T>) {
    super();
    if (source) {
      this.load(source);
    }
  }

  unload() {
    this.splice(0);
    this.loading = true;
    this.loaded = false;
  }

  async load(elements: Loader<T>) {
    if (elements && typeof elements === 'object' && 'then' in elements) {
      this.unload();
      const resolvedElements = await elements;
      if (resolvedElements) {
        this.push(...resolvedElements);
      }
    } else if (typeof elements === 'object' && Symbol.iterator in elements) {
      if (elements) {
        this.splice(0, this.length, ...elements);
      } else {
        this.splice(0);
      }
    } else {
      this.splice(0);
      console.error(elements);
    }

    this.loading = false;
    this.loaded = true;
  }
}
