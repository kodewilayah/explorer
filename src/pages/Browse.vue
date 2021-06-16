
<template>
  <header class="mt-6">
    <h1 class="text-2xl font-semibold mb-6 border-b pb-4">
      <router-link to="/">
        kodewilayah<span class="text-red-500">.id</span>
      </router-link>
    </h1>
  </header>
  <div v-if="isLoading" class="py-9 text-gray-400 text-3xl font-light">
    <v-spinner></v-spinner>
  </div>
  <div v-else class="mb-8">
    <div class="mt-8 mb-4">
      <router-link to="/" v-if="!parent" class="text-red-700">
        &larr; Indonesia
      </router-link>
      <router-link :to="region?.parentCode" v-else class="text-red-700">
        &larr;
        {{parent.prefix}}
        {{parent.name}}
      </router-link>
    </div>
    <h1 class="mb-8">
      <span class="text-3xl font-semibold">
        <span class="font-normal">{{region.prefix}}</span>
        {{region.name}}
      </span>
    </h1>
    <template v-if="region.level < 4">
      <h1 class="text-gray-400 mb-2">{{childrenHeading}} di bawah {{region?.prefix}} {{region?.name}}:</h1>
      <template v-if="children.loading">
        <v-spinner></v-spinner>
      </template>
      <template v-else>
        <table class="table-auto w-full -mx-2">
          <tbody>
            <tr v-for="r in children" :key="r.code"  class="hover:bg-gray-100">
              <td class="w-14 p-2 font-mono text-gray-300 text-sm">
                <router-link :to="r.code">{{r.code}}</router-link>
              </td>
              <td class="p-2 text-red-700 group">
                <router-link :to="r.code">
                  <span class="text-red-400">{{r.prefix}}</span>
                  {{r.name}}
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { defineProps, computed, watchEffect } from 'vue';
  import { useRegion } from '../lib/region';
  import VSpinner from '../components/VSpinner.vue';
  import { codeToChildren } from '../lib/store';

  const props = defineProps({
    code: String
  });

  const region = useRegion(() => props.code);
  const name = computed(() => region.name);
  const parent = computed(() => region.parent);
  const children = computed(() => region.children);
  const isLoading = computed(() => region.loading);

  const childrenHeading = computed(() => {
    if (region.level === 1)
      return 'Kabupaten/kota';
    else if (region.level === 2)
      return 'Kecamatan';
    else if (region.level === 3)
      return 'Kelurahan/desa';

    return `Daerah Tingkat {region.level + 1}`;
  })

  watchEffect(() => {
    if (!isLoading) {
      document.title = `${region.prefix} ${region.name}`;
    }
  });

  const code = props.code;
</script>