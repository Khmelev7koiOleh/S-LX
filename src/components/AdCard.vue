<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'

import { ref, onMounted, computed, watch, toRefs } from 'vue'
import type { AdsType } from '@/types/ads-type'

import { useGetUserStore } from '../stores/current-user-store'
import Button from './ui/button/Button.vue'
const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const props = defineProps<{
  title: string
  description: string
  img: string
  price: string
  id: string | number
  type: string
  size?: string
  horisontal?: boolean
  col?: boolean
}>()

const { title, description, img, price, id, type, size, horisontal, col } = toRefs(props)

const ifHorisontal = computed(() => {
  if (horisontal.value) {
    return true
  } else {
    return false
  }
})
const emit = defineEmits(['navigate'])

function goToAd() {
  emit('navigate', id.value)
}
const addToFavorites = async (id: string) => {
  console.log(id)
  const { data, error } = await supabase.from('favorites').insert({
    user_id: user.value.id,
    ad_id: id,
    img: img.value,
  })

  if (error) {
    console.log(error)
  }
}

// const reduceToEight = computed(() => {
//   return ads.value.slice(0, 8)
// })
</script>

<template>
  <div @click="goToAd" class="bg-white flex justify-center items-center">
    <div class="w-full h-full flex justify-center items-center px-4 py-1">
      <div
        :class="
          ifHorisontal
            ? 'w-full h-full flex flex-col justify-between items-center gap-2 '
            : 'w-full h-full flex justify-between items-center gap-2 '
        "
      >
        <div
          :class="
            col
              ? 'flex flex-col gap-3 items-center justify-center rounded-lg bg-gray-0'
              : 'flex  gap-3 items-center justify-center rounded-lg bg-gray-0'
          "
        >
          <div class="w-full overflow-hidden" :style="{ height: size, width: size }">
            <img :src="img" alt="" class="w-full h-full object-cover rounded-t-lg" />
          </div>
          <p class="w-full flex flex-wrap justify-center items-center break-all">{{ title }}</p>
          <!-- <p>{{ description }}</p> -->
        </div>

        <p>{{ price }} €.</p>
      </div>

      <Button
        class="flex items-center w-10 h-10 text-white rounded-full cursor-pointer"
        @click.stop="addToFavorites(id)"
      >
        <Icon icon="material-symbols:favorite" class="text-red-600" width="24" height="24" />
      </Button>
    </div>
  </div>
</template>
