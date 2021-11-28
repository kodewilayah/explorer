<template>
  <div>
    <div class="mt-12 md:mt-16 lg:mt-20">
      <h1 class="text-4xl font-semibold mb-6">kodewilayah<span class="text-red-500">.id</span></h1>
      <div>
        <p class="mb-6 text-gray-600 text-xl">
          Referensi lengkap nama dan kode wilayah se-Indonesia
        </p>
      </div>

      <div>
        <v-search-form @submit="search"></v-search-form>
      </div>
    </div>
  </div>
  <div class="mt-4 md:mt-8 lg:mt-12">
    <h2 class="mb-4 text-gray-800 font-semibold">Telusuri berdasarkan provinsi</h2>
    <div class="md:flex md:flex-cols-2 lg:flex-cols-3 flex-flow-col-dense md:gap-4">
      <ul v-for="cluster in clusters" :key="cluster[0][0]" class="flex-1">
        <li v-for="[id, name] in cluster" :key="id" class="md:mb-1 lg:text-xl lg:mb-2 text-gray-700">
          <router-link
            :to="`/${id}`"
            class="text-red-700 hover:text-red-900 hover:bg-red-50 md:hover:bg-transparent -mx-2 px-2 md:mx-0 md:px-0 block md:inline py-2 md:py-0 cursor-pointer">
            <span class="mr-1 text-gray-400 font-mono text-sm" aria-hidden="true">{{id}}</span>
            {{name}}
          </router-link>
        </li>
      </ul>
    </div>
    <hr class="mt-8 mb-8" />
    <div class="flex flex-col md:flex-row">
      <p class="mb-4 md:mr-8">
        <a href="https://raw.githubusercontent.com/kodewilayah/permendagri-72-2019/main/dist/base.csv"
            class="px-12 py-3 inline-block bg-red-700 hover:bg-red-500 transition-colors duration-500 rounded-xl text-white font-semibold"
        >Unduh CSV</a>
      </p>
      <ul class="md:flex-1 mb-4 text-gray-500 text-lg">
        <li class="mb-1">
          📄 <b class="font-semibold text-gray-800">Siap digunakan</b> dalam bentuk CSV yang sudah dibersihkan</li>
        <li class="mb-1">
          🇮🇩 <b class="font-semibold text-gray-800">Lengkap</b> berdasarkan Permendagri No. 72/2019 hingga tingkat kelurahan/desa</li>
        <li>✅ <b class="font-semibold text-gray-800">Bebas pakai</b> tanpa atribusi sama sekali</li>
      </ul>
    </div>
    <hr class="mt-4 mb-8" />
    <p class="text-xs mb-8"><a href="https://github.com/kodewilayah" class="text-red-700">Berkontribusi di GitHub &rarr;</a></p>
    <!-- <h2 class="mb-2 text-gray-800 font-semibold">Sumber data</h2>
    <ul class="mb-12 text-gray-600 list-disc ml-5">
      <li class="mb-1">Permendagri 72/2019 (Dukcapil)</li>
      <li class="mb-1">Kode pos <v-label>Coming soon</v-label></li>
      <li class="mb-1">BPS <v-label>Coming soon</v-label></li>
      <li class="mb-1">SLIK OJK (POJK 18/POJK.03/2017) <v-label>Coming soon</v-label></li>
      <li class="mb-1">Pusdafil OJK <v-label>Coming soon</v-label></li>
    </ul> -->
  </div>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import VLabel from '../components/VLabel.vue';
  import VSearchForm from "../components/VSearchForm.vue";
  document.title = 'Kode Wilayah Indonesia';

  const clusters: [number, string][][] = [
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
      [61,'Kalimantan Barat'],
      [62,'Kalimantan Tengah'],
      [63,'Kalimantan Selatan'],
      [64,'Kalimantan Timur'],
      [65,'Kalimantan Utara'],
    ], [
      [52,'Nusa Tenggara Barat'],
      [53,'Nusa Tenggara Timur'],
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

  const router = useRouter()

  function search(query: string) {
    router.push({ path: '/search', query: { q: query }})
  }
</script>
