<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'

import { ref, onMounted, computed, watch, toRefs } from 'vue'
import type { AdsType } from '@/types/ads-type'

const props = defineProps<{ ads: AdsType[] }>()

const { ads } = toRefs(props)

const reduceToEight = computed(() => {
  return ads.value.slice(0, 8)
})
</script>

<template>
  <div class="bg-gray-50">
    <div class="p-20 w-full">
      <div class="grid grid-cols-4 justify-center items-center gap-20">
        <div v-for="ad in reduceToEight" :key="ad.id">
          <RouterLink
            :to="`/ad/${ad.id}`"
            class="min-w-[300px] flex flex-col gap-4 items-center justify-center bg-white rounded-lg bg-gray-0 shadow"
          >
            <div class="w-full h-[250px] overflow-hidden">
              <img :src="ad.img" alt="" class="w-full h-full object-cover rounded-t-lg" />
            </div>
            <p>{{ ad.title }}</p>
            <p>{{ ad.description }}</p>
            <p>{{ ad.price }} €.</p>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
