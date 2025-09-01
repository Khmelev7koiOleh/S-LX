<script setup lang="ts">
// import { Icon } from '@iconify/vue'
// import { supabase } from '../lib/supabaseClient'

import { computed, toRefs } from 'vue'
// import type { AdsType } from '@/types/ads-type'

// import { useGetUserStore } from '../stores/current-user-store'
// import Button from './ui/button/Button.vue'
import AddFavoritesButton from './AddFavoritesButton.vue'
// const userStore = useGetUserStore()
// const { user } = toRefs(userStore)

const props = defineProps<{
  title: string | null
  description: string | null
  img: string[] | null
  price: number | null
  id: string
  created_at: string
  if_discount: boolean | null
  discount: number | null
  type: string | null
  size?: string
  h_size?: string
  horisontal?: boolean
  col?: boolean
  if_favorite?: boolean
  w_container?: string
  h_container?: string
  schrink?: boolean
  start?: boolean
  center?: boolean
  end?: boolean
}>()

const {
  title,
  description,
  img,
  price,
  id,
  created_at,
  if_discount,
  discount,
  type,
  size,
  h_size,
  horisontal,
  col,
  if_favorite,
  w_container,
  h_container,
  schrink,
  start,
  center,
  end,
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

// const addToFavorites = async (id: string) => {
//   console.log(id)
//   const { data, error } = await supabase.from('favorites').insert({
//     user_id: user.value.id,
//     ad_id: id,
//     img: img.value,
//   })

//   if (error) {
//     console.log(error)
//   }
// }
// const computeDiscount = computed(() => {
//   return Math.floor(price.value / discount.value)
// })

const computedDiscount = computed(() => {
  const original = price.value === null ? null : parseFloat(price.value.toString())
  const discounted = discount.value === null ? null : parseFloat(discount.value.toString())

  if (!original || !discounted || original <= discounted) return 0

  const percent = ((original - discounted) / original) * 100
  return Math.round(percent) // round to nearest integer
})

const justifyComputed = computed(() => {
  if (start.value) return 'justify-start'
  if (center.value) return 'justify-center'
  if (end.value) return 'justify-end'
  return 'justify-center'
})
// const reduceToEight = computed(() => {
//   return ads.value.slice(0, 8)
// })
</script>

<template>
  <div
    :class="` flex justify-center items-center shadow rounded-t-md relative cursor-pointer bg-white `"
    :style="{ width: w_container, height: h_container }"
  >
    <div v-if="if_favorite" class="absolute top-2 right-2">
      <AddFavoritesButton
        :title="title"
        :description="description"
        :id="id"
        :img="[img?.[0] || '']"
        :price="price"
        :created_at="created_at"
        :type="type"
        :if_discount="if_discount"
        :discount="discount"
      />
      <!-- <Button
                class="flex items-center w-8 h-8 bg-white rounded-full shadow cursor-pointer text-red-600 hover:text-white hover:bg-red-600"
                @click.stop="addToFavorites(id)"
              >
                <Icon icon="material-symbols:favorite" width="20" height="20" />
              </Button>
              -->
    </div>
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
              ? 'w-full flex flex-col gap-3 items-center justify-center  bg-gray-0'
              : ' w-full flex   items-between justify-center  bg-gray-0 '
          "
        >
          <div
            class="min-w-[5rem] bg-transparent object-cover overflow-hidden h-full rounded-t-sm"
            :style="{ width: size, height: h_size }"
          >
            <img
              :src="img?.[0] || undefined"
              alt=""
              class="w-full h-full object-cover"
              :style="{ width: size, height: h_size }"
            />
          </div>
          <div
            class="w-full flex flex-col justify-between items-center gap-4"
            :class="col ? 'py-0' : 'py-4'"
          >
            <div class="w-full flex flex-col justify-center items-center gap-4 pl-2">
              <p
                class="w-full flex flex-wrap justify-start items-center break-all text-md font-semibold px-2"
              >
                {{ title }}
              </p>
              <p
                :class="
                  schrink
                    ? ' w-[80%] self-start  break-words  px-2 text-sm font-light line-clamp-1'
                    : ' w-full self-center break-words line-clamp-1 px-2 text-sm font-light'
                "
              >
                {{ description }}
              </p>
            </div>
            <div
              :class="
                col
                  ? 'w-full  absolute bottom-0 right-0 flex flex-col justify-end items-end gap-2'
                  : 'w-[100%] flex flex-col justify-end items-end gap-2  '
              "
            >
              <div
                v-if="if_discount"
                class="w-full flex justify-center items-center p-0 bg-red-400"
              >
                <p class="text-md font-semibold text-white">-{{ computedDiscount }}%</p>
              </div>
              <div :class="['w-full flex items-center gap-4 px-4 py-1', justifyComputed]">
                <p
                  v-if="price"
                  :class="if_discount ? 'line-through text-md text-red-500 ' : ' py-2 '"
                >
                  {{ price }} €.
                </p>

                <p v-if="if_discount" class="text-md">{{ discount }} €.</p>
              </div>
            </div>
          </div>
          <!-- <p>{{ description }}</p> -->
        </div>
      </div>
    </div>
  </div>
</template>
