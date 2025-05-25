<!-- src/views/AdDetail.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import type { AdsType } from '@/types/ads-type'

const route = useRoute()
const ad = ref<AdsType | null>(null)

onMounted(async () => {
  const { data, error } = await supabase.from('ads').select('*').eq('id', route.params.id).single()

  if (!error) {
    ad.value = data
  }
})
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4" v-if="ad">
    <div class="w-[500px] h-[350px] overflow-hidden">
      <img :src="ad.img" alt="" class="w-full h-full object-cover rounded-lg" />
    </div>
    <h1>{{ ad.title }}</h1>
    <p>{{ ad.description }}</p>
    <p>{{ ad.price }} €</p>
  </div>
</template>
