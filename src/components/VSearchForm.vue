<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({ query: String, autofocus: Boolean })

const emit = defineEmits(['update:query', 'submit'])

const query = ref<string>(props.query || '');
watch(query, q => emit('update:query', q))

const input = ref<HTMLInputElement>();
onMounted(() => {
  if (props.autofocus && window.matchMedia('min-width: 1024px')) {
    input.value?.focus();
  }
});

function onSubmit() {
  emit('submit', query.value);
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <p class="flex flex-row">
      <input type="search" v-model="query" ref="input" class="block flex-1 md:flex-none md:w-3/5 lg:w-1/2 p-3 rounded-xl border" />
      <button type="submit" class="py-3 px-6 rounded-xl ml-2 bg-red-500 text-white font-semibold">Cari</button>
    </p>
  </form>
</template>