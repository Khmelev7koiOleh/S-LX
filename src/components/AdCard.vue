<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'

import { ref, onMounted, computed, watch, toRefs } from 'vue'
import type { AdsType } from '@/types/ads-type'

const props = defineProps<{
  title: string
  description: string
  img: string
  price: string
  id: string | number
  type: string
  size?: string
  horisontal?: boolean
}>()

const { title, description, img, price, id, type, size, horisontal } = toRefs(props)

const ifHorisontal = computed(() => {
  if (horisontal.value) {
    return true
  } else {
    return false
  }
})

// const reduceToEight = computed(() => {
//   return ads.value.slice(0, 8)
// })
</script>

<template>
  <div class="bg-white flex justify-center items-center">
    <div class="w-full h-full flex justify-center items-center px-4 py-1">
      <div
        :class="
          ifHorisontal
            ? 'w-full h-full flex flex-col justify-between items-center gap-2 '
            : 'w-full h-full flex justify-between items-center gap-2 '
        "
      >
        <div class="flex gap-3 items-center justify-center rounded-lg bg-gray-0">
          <div class="w-full overflow-hidden" :style="{ height: size, width: size }">
            <img :src="img" alt="" class="w-full h-full object-cover rounded-t-lg" />
          </div>
          <p>{{ title }}</p>
          <!-- <p>{{ description }}</p> -->
        </div>

        <p>{{ price }} €.</p>
      </div>
    </div>
  </div>
</template>
