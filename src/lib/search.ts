import { reactive } from "vue";
import Fuse from "fuse.js";
import { getPrefix } from "../lib/dagri";
import { useStore } from "../lib/store";
import { LoadableArray } from "../lib/loadable";

type IndexItem = {
  code: string;
  label: string;
  name: string;
};

const fuse: Fuse<IndexItem> = new Fuse([], {
  threshold: 0.05,
  keys: [
    {
      name: "label",
      weight: 1,
    },
    {
      name: "name",
      weight: 2,
    },
  ],
  includeScore: true,
});

let isIndexLoaded = false;
let isIndexLoading = false;

const store = useStore();

async function loadIndex(): Promise<void> {
  if (isIndexLoaded || isIndexLoading) {
    return;
  } else {
    isIndexLoading = true;
  }

  const basenames = [
    11, 12, 13, 16, 14, 21, 15, 17, 18, 19, 31, 36, 32, 33, 34, 35, 51,
    61, 62, 63, 64, 65, 52, 53, 71, 72, 73, 74, 75, 76, 81, 82, 91, 92,
  ];

  const fetchPromises = basenames.map((b) =>
    store.fetchBasenameIfNotFetched(b.toString())
  );
  await Promise.all(fetchPromises);

  const allCodes = store.codeToName.keys();

  const indexObjects: IndexItem[] = [];
  for (const code of allCodes) {
    const prefix = getPrefix(code);
    const name = store.getRegionName(code);
    const label = `${prefix} ${name}`;
    indexObjects.push({ code, name, label });
  }

  fuse.setCollection(indexObjects);
  isIndexLoading = false;
  isIndexLoaded = true;
}

const indexingPromise = loadIndex();

const results = reactive(new LoadableArray<Fuse.FuseResult<IndexItem>>())
function search(query: string) {
  results.load(indexingPromise.then(() => fuse.search(query)));
}

export function useSearch() {
  return { results, search };
}
