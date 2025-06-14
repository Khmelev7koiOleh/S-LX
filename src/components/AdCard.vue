<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'

import { ref, onMounted, computed, watch, toRefs } from 'vue'
import type { AdsType } from '@/types/ads-type'

import { useGetUserStore } from '../stores/current-user-store'
import Button from './ui/button/Button.vue'
import AddFavoritesButton from './AddFavoritesButton.vue'
const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const props = defineProps<{
  title: string
  description: string
  img: string
  price: string
  id: string | number
  user_name: string
  created_at: string | undefined
  type: string
  size?: string
  h_size?: string
  horisontal?: boolean
  col?: boolean
  if_favorite?: boolean
  is_user_name?: boolean
  w_container?: string
  h_container?: string
}>()

const {
  title,
  description,
  img,
  price,
  id,
  user_name,
  created_at,
  type,
  size,
  h_size,
  horisontal,
  col,
  if_favorite,
  is_user_name,
  w_container,
  h_container,
} = toRefs(props)

const ifHorisontal = computed(() => {
  if (horisontal.value) {
    return true
  } else {
    return false
  }
})
// const emit = defineEmits(['navigate'])

// function goToAd() {
//   emit('navigate', id.value)
// }
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
  <div
    :class="`flex justify-center items-center shadow rounded-t-md relative cursor-pointer `"
    :style="{ width: w_container, height: h_container }"
  >
    <div class="w-full h-full flex justify-center items-center">
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
          <div
            class="w-full overflow-hidden h-full rounded-t-md"
            :style="{ width: size, height: h_size }"
          >
            <img
              :src="img"
              alt=""
              class="w-full h-full object-cover"
              :style="{ width: size, height: h_size }"
            />
          </div>
          <div class="w-full flex justify-between items-center">
            <p class="w-full flex flex-wrap justify-center items-center break-all px-2">
              {{ title }}
            </p>

            <div v-if="if_favorite" class="absolute top-2 right-2">
              <AddFavoritesButton
                :title="title"
                :description="description"
                :id="id"
                :img="img"
                :price="price"
                :created_at="created_at"
                :type="type"
              />
              <!-- <Button
                class="flex items-center w-8 h-8 bg-white rounded-full shadow cursor-pointer text-red-600 hover:text-white hover:bg-red-600"
                @click.stop="addToFavorites(id)"
              >
                <Icon icon="material-symbols:favorite" width="20" height="20" />
              </Button>
              -->
            </div>
          </div>
          <!-- <p>{{ description }}</p> -->
        </div>

        <div class="p-4">
          <p class="w-full flex flex-wrap justify-end items-center break-all">{{ price }} €.</p>
          <p
            v-if="is_user_name"
            class="w-full flex flex-wrap justify-center items-center break-all"
          >
            {{ user_name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
