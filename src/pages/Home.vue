<template>
  <div class="mt-12 md:lt-18 lg:mt-24">
    <h1 class="text-4xl font-semibold mb-6">kodewilayah<span class="text-red-500">.id</span></h1>
    <p class="mb-4 text-gray-500 text-xl">Referensi terkurasi kode wilayah se-Indonesia, hingga tingkat kelurahan/desa</p>
    <p class="mb-8">
      <a href="/data/dagri2017.csv" class="px-6 py-3 inline-block bg-red-500 rounded-lg text-white font-semibold">Unduh CSV</a>
      <!-- <a href="#/browse" class="px-6 py-3 inline-block bg-gray-100 text-gray-600 rounded-lg ml-4 border-gray-200 border">Browse hierarchy</a> -->
    </p>
    <hr class="mb-8" />
    <h2 class="mb-2 text-gray-800 font-semibold">Telusuri berdasarkan provinsi</h2>
    <div class="md:flex md:flex-cols-2 lg:flex-cols-3 flex-flow-col-dense md:gap-4">
      <ul v-for="cluster in islands" :key="cluster[0][0]" class="flex-1">
        <li v-for="[id, name] in cluster" :key="id" class="mb-1">
          <router-link :to="`/${id}`" class="text-red-700 hover:text-red-500">
            <span class="mr-1 text-gray-300 font-mono text-sm" aria-hidden="true">{{id}}</span>
            {{name}}
          </router-link>
        </li>
      </ul>
    </div>
    <hr class="mt-8 mb-8" />
    <h2 class="mb-2 text-gray-800 font-semibold">Sumber data</h2>
    <ul class="mb-12 text-gray-600 list-disc ml-5">
      <li class="mb-1">Permendagri 137/2017 (Dukcapil)</li>
      <li class="mb-1">Kode pos <v-label>Coming soon</v-label></li>
      <li class="mb-1">BPS <v-label>Coming soon</v-label></li>
      <li class="mb-1">SLIK OJK (POJK 18/POJK.03/2017) <v-label>Coming soon</v-label></li>
      <li class="mb-1">Pusdafil OJK <v-label>Coming soon</v-label></li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
  import VLabel from '../components/VLabel.vue';
  type Cluster = [number, string][];
  const islands: Cluster[] = [
    [
      [11,'Aceh'],
      [12,'Sumatera Utara'],
      [13,'Sumatera Barat'],
      [16,'Sumatera Selatan'],
      [14,'Riau'],
      [21,'Kepulauan Riau'],
      [15,'Jambi'],
      [17,'Bengkulu'],
      [18,'Lampung'],
      [19,'Bangka Belitung'],
    ], [
      [31,'DKI Jakarta'],
      [36,'Banten'],
      [32,'Jawa Barat'],
      [33,'Jawa Tengah'],
      [34,'DI Yogyakarta'],
      [35,'Jawa Timur'],
      [51,'Bali'],
      [52,'Nusa Tenggara Barat'],
      [53,'Nusa Tenggara Timur'],
      [61,'Kalimantan Barat'],
      [62,'Kalimantan Tengah'],
      [63,'Kalimantan Selatan'],
      [64,'Kalimantan Timur'],
      [65,'Kalimantan Utara'],
    ], [
      [71,'Sulawesi Utara'],
      [72,'Sulawesi Tengah'],
      [73,'Sulawesi Selatan'],
      [74,'Sulawesi Tenggara'],
      [75,'Gorontalo'],
      [76,'Sulawesi Barat'],
      [81,'Maluku'],
      [82,'Maluku Utara'],
      [91,'Papua'],
      [92,'Papua Barat'],
    ]
  ];
</script>