<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useSearch } from "../lib/search";
import VSpinner from "../components/VSpinner.vue";
import VSearchForm from "../components/VSearchForm.vue";
import { useStore } from "../lib/store";
import { RouteLocationRaw, useRoute, useRouter } from "vue-router";

const search = useSearch();
const store = useStore();
const router = useRouter();
const route = useRoute();
const query = ref('');

const results = computed(() => search.results.map(r => store.getRegion(r.item.code)));

watchEffect(() => {
  const q = route.query.q?.toString();
  if (q) {
    query.value = q;
    if (q !== search.query) {
      // Don't immediately run the search because it will freeze the UI
      search.results.unload()
      setTimeout(() => search.search(query.value), 50);
    }
  } else if (search.query) {
    query.value = search.query
  }
})

async function onSubmit(query: string) {
  await router.push({
    path: '/search',
    query: { q: query }
  });
  search.search(query);
}

function to(code: string): RouteLocationRaw {
  return {
    name: 'browse',
    params: {
      code
    },
    query: {
      q: query.value
    }
  }
}
</script>

<template>
  <header class="mt-6">
    <h1 class="text-2xl font-semibold mb-6 border-b pb-4">
      <router-link to="/">
        kodewilayah<span class="text-red-500">.id</span>
      </router-link>
    </h1>
  </header>
  <v-search-form :autofocus="!query" v-model:query="query" @submit="onSubmit" class="block py-5"></v-search-form>
  <div v-if="search.results.loading">
    <v-spinner></v-spinner>
  </div>
  <template v-else-if="search.results.length > 0">
    <p class="text-gray-500 mb-5">{{search.results.length}} hasil ditemukan untuk &OpenCurlyDoubleQuote;{{search.query}}&CloseCurlyDoubleQuote;</p>
    <table class="table-auto w-full -mx-2 mb-8">
      <tbody>
        <tr v-for="r in results" :key="r.code" class="hover:bg-gray-100">
          <td class="w-14 p-2 font-mono text-gray-300 text-sm">
            <router-link :to="to(r.code)">{{ r.code }}</router-link>
          </td>
          <td class="p-2 text-red-700 group">
            <router-link :to="to(r.code)">
              <span class="text-red-400">{{ r.prefix }}</span>
              {{ r.name }}
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </template>
  <p v-else-if="search.results.loaded">Tidak ada wilayah yang ditemukan.</p>
</template>