<template>
  <div class="mt-6 md:lt-12 lg:mt-24">
    <h1 class="text-4xl font-semibold mb-6">kodewilayah<span class="text-red-500">.id</span></h1>
    <p class="mb-4 text-gray-500 text-xl">Referensi terpilih kode wilayah se-Indonesia, hingga tingkat kelurahan/desa</p>
    <p class="mb-8">
      <a href="/data/dagri2017.csv" class="px-6 py-3 inline-block bg-red-500 rounded-lg text-white font-semibold">Unduh CSV</a>
      <!-- <a href="#/browse" class="px-6 py-3 inline-block bg-gray-100 text-gray-600 rounded-lg ml-4 border-gray-200 border">Browse hierarchy</a> -->
    </p>
    <hr class="mb-8" />
    <h2 class="mb-2 text-gray-800 font-semibold">Sumber data</h2>
    <ul class="mb-4 text-gray-600 list-disc ml-5">
      <li class="mb-1">Permendagri 137/2017 (Dukcapil)</li>
      <li class="mb-1">Kode pos <v-label>Coming soon</v-label></li>
      <li class="mb-1">BPS <v-label>Coming soon</v-label></li>
      <li class="mb-1">SLIK OJK (POJK 18/POJK.03/2017) <v-label>Coming soon</v-label></li>
      <li class="mb-1">Pusdafil OJK <v-label>Coming soon</v-label></li>
    </ul>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import VLabel from '../components/VLabel.vue';
  export default defineComponent({
    components: { 'v-label': VLabel }
  })
</script>