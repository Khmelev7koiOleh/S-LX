<script setup lang="ts">
import { supabase } from '../lib/supabaseClient'
import { ref, onMounted } from 'vue'

const ads = ref<any>(null)

const getAds = async () => {
  const { data, error } = await supabase.from('ads').select('*')

  if (error) return
  else {
    ads.value = data
  }
}

onMounted(() => {
  getAds()
})
</script>

<template>
  <h1 class="text-2xl">About</h1>
  <div class="p-20">
    <div class="w-[80%] flex justify-center items-center gap-8">
      <div v-for="ad in ads" :key="ad.id">
        <img :src="ad.img" alt="" />

        <p>{{ ad.title }}</p>
        <p>{{ ad.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
