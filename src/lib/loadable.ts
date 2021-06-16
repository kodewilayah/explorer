export type Loader<T> = (() => T) | (() => PromiseLike<T>) | (T | PromiseLike<T>)

export type LoadingStateSetter = (loading: boolean, loaded: boolean) => void;

export async function resolveLoader<T>(
  loader: Loader<T>,
  setLoadingState: LoadingStateSetter = () => null
): Promise<T> {
  let resolved: T;
  if (typeof loader === 'function') {
    setLoadingState(true, false);
    resolved = await Promise.resolve<T>((loader as (() => T) | (() => PromiseLike<T>))())
    setLoadingState(false, true);
  } else if (typeof (loader as PromiseLike<T>).then === 'function') {
    setLoadingState(true, false);
    resolved = await (loader as PromiseLike<T>);
    setLoadingState(false, true);
  } else {
    resolved = (loader as T);
    setLoadingState(false, true);
  }

  return resolved;
}

export class LoadableArray<T> extends Array<T> {
  loading = false;
  loaded = false;

  constructor(source?: Iterable<T>) {
    super();
    if (source) {
      this.load(source);
    }
  }

  setLoadingState(loading: boolean, loaded: boolean) {
    this.loading = loading;
    this.loaded = loaded;
  }

  async load(loader: Loader<Iterable<T>>) {
    this.splice(0);
    this.push(...await resolveLoader(loader, (loading, loaded) => this.setLoadingState(loading, loaded)))
  }
}

