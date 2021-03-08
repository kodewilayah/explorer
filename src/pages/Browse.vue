
<template>
  <header class="mt-6">
    <h1 class="text-2xl font-semibold mb-6 border-b pb-4">
      <router-link to="/">
        <span class="text-red-700 font-light mr-4 border-r pr-4">telusur</span>
        kodewilayah
        <span class="text-red-500">.id</span>
      </router-link>
    </h1>
  </header>
  <div v-if="isLoading" class="py-4 text-gray-400">
    Loading data...
  </div>
  <div v-else class="mb-8">
    <div class="mt-8 mb-2">
      <router-link to="/" v-if="region.level === 1" class="text-red-700">
        &larr; Indonesia
      </router-link>
      <router-link :to="region.parentCode" v-else class="text-red-700">
        &larr;
        {{findRegion(region.parentCode).prefix}}
        {{findRegion(region.parentCode).name}}
      </router-link>
    </div>
    <h1 class="mb-8">
      <span class="text-3xl font-semibold">
        <span class="font-normal">{{region.prefix}}</span>
        {{region.name}}
      </span>
    </h1>
    <table class="table-auto w-full -mx-2" v-if="childrenCodes.length > 0">
      <thead>
        <tr>
          <th class="text-left font-normal text-gray-300 p-2 pr-4 w-14">Kode</th>
          <th class="text-left font-normal text-gray-300 p-2">Nama</th>
        </tr>
      </thead>
      <tbody>
        <router-link v-for="r in region.childrenCodes" :key="r" :to="`/${r}`" custom v-slot="{ navigate }">
          <tr @click="navigate" class="hover:bg-red-50 cursor-pointer">
            <td class="p-2 font-mono text-gray-500 text-sm">
              <router-link :to="`/${r}`">{{r}}</router-link>
            </td>
            <td class="p-2 text-gray-800">
              <router-link :to="`/${r}`">
                <span class="text-gray-600">{{findRegion(r).prefix}}</span>
                {{findRegion(r).name}}
              </router-link>
            </td>
          </tr>
        </router-link>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
  import { defineProps, ref, reactive, watchEffect } from 'vue';
  import { useDagriData } from '../dagri';

  const props = defineProps({
    code: String
  });

  const name = ref<string | undefined>('');
  const region = ref<any>();
  const childrenCodes = reactive<string[]>([]);
  const { isLoading, regionMap, findRegion } = useDagriData();

  watchEffect(() => {
    if (!isLoading.value) {
      if (props.code) {
        name.value = regionMap.get(props.code || '')?.name;
        region.value = findRegion(props.code);
        childrenCodes.splice(0);
        childrenCodes.push(...region.value.childrenCodes)
      }
    }
  });

  const code = props.code;
</script>