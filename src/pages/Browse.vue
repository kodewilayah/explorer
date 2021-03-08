
<template>
  <header class="mt-6">
    <h1 class="text-2xl font-semibold mb-6 border-b pb-4">
      <router-link to="/">
        kodewilayah<span class="text-red-500">.id</span>
      </router-link>
    </h1>
  </header>
  <div v-if="isLoading" class="py-9 text-gray-400 text-3xl font-light">
    Loading...
  </div>
  <div v-else class="mb-8">
    <div class="mt-8 mb-4">
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
    <template v-if="childrenCodes.length > 0">
      <h1 class="text-gray-400 mb-2">Daerah Tingkat {{region.level + 1}} di bawah {{region.prefix}} {{region.name}}:</h1>
      <table class="table-auto w-full -mx-2">
        <tbody>
          <router-link v-for="r in region.childrenCodes" :key="r" :to="`/${r}`" custom v-slot="{ navigate }">
            <tr @click="navigate" class="hover:bg-red-50 cursor-pointer">
              <td class="w-14 p-2 font-mono text-gray-300 text-sm">
                <router-link :to="`/${r}`">{{r}}</router-link>
              </td>
              <td class="p-2 text-red-700">
                <router-link :to="`/${r}`">
                  <span class="opacity-70">{{findRegion(r).prefix}}</span>
                  {{findRegion(r).name}}
                </router-link>
              </td>
            </tr>
          </router-link>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { defineProps, ref, reactive, watchEffect } from 'vue';
  import { useTitle } from '@vueuse/core';
  import { useDagriData } from '../dagri';

  const props = defineProps({
    code: String
  });

  const name = ref<string | undefined>('');
  const region = ref<any>();
  const childrenCodes = reactive<string[]>([]);
  const { isLoading, regionMap, findRegion } = useDagriData();

  const title = useTitle();

  watchEffect(() => {
    if (!isLoading.value) {
      if (props.code) {
        name.value = regionMap.get(props.code || '')?.name;
        region.value = findRegion(props.code);
        childrenCodes.splice(0);
        childrenCodes.push(...region.value.childrenCodes);
        title.value = `${region.value.prefix} ${region.value.name}`;
      }
    }
  });

  const code = props.code;
</script>