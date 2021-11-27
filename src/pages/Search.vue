<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useSearch } from "../lib/search";
import VSpinner from "../components/VSpinner.vue";
import { useStore } from "../lib/store";

const store = useStore();
const query = ref("");
const input = ref<HTMLInputElement>();

const search = useSearch();
const results = computed(() => search.results.map(r => store.getRegion(r.item.code)));

onMounted(() => {
  input.value && input.value.focus()
})
</script>

<template>
  <header class="mt-6">
    <h1 class="text-2xl font-semibold mb-6 border-b pb-4">
      <router-link to="/">
        kodewilayah
        <span class="text-red-500">.id</span>
      </router-link>
    </h1>
  </header>
  <form @submit.prevent="search.search(query)" class="block py-5">
    <p class="flex flex-row">
      <input type="text" v-model="query" ref="input" class="block flex-1 p-3 rounded border" />
      <button
        type="submit"
        class="py-3 px-6 rounded ml-2 bg-red-500 text-white font-semibold"
      >Cari</button>
    </p>
  </form>
  <div v-if="search.results.loading">
    <v-spinner></v-spinner>
  </div>
  <table class="table-auto w-full -mx-2">
    <tbody>
      <tr v-for="r in results" :key="r.code" class="hover:bg-gray-100">
        <td class="w-14 p-2 font-mono text-gray-300 text-sm">
          <router-link :to="r.code">{{ r.code }}</router-link>
        </td>
        <td class="p-2 text-red-700 group">
          <router-link :to="r.code">
            <span class="text-red-400">{{ r.prefix }}</span>
            {{ r.name }}
          </router-link>
        </td>
      </tr>
    </tbody>
  </table>
</template>