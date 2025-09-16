<script setup lang="ts">
import { computed, toRefs } from 'vue'

import AddFavoritesButton from './AddFavoritesButton.vue'

const props = defineProps<{
  title: string | null
  description: string | null
  img: string[] | null
  price: number | null
  id: string
  created_at: string
  if_discount: boolean | null
  discount: number | null
  discount_banner?: boolean
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
const computedDiscount = computed(() => {
  const original = price.value === null ? null : parseFloat(price.value.toString())
  const discounted = discount.value === null ? null : parseFloat(discount.value.toString())

  if (!original || !discounted || original <= discounted) return 0

  const percent = ((original - discounted) / discounted) * 100
  return Math.round(percent)
})

const justifyComputed = computed(() => {
  if (start.value) return 'justify-start'
  if (center.value) return 'justify-center'
  if (end.value) return 'justify-end'
  return 'justify-center'
})
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
              ? 'w-full flex flex-col gap-3 items-center justify-center  bg-gray-0  '
              : ' w-full flex items-between justify-center  bg-gray-0 '
          "
        >
          <div
            class="min-w-[5rem] bg-transparent overflow-hidden h-full rounded-t-sm"
            :style="{ width: size, height: h_size }"
          >
            <img
              :src="img?.[0] || undefined"
              alt=""
              class="w-full h-full object-contain"
              :style="{ width: size, height: h_size }"
            />
          </div>
          <div class="w-full flex flex-col justify-between items-center gap-4 py-3">
            <div class="w-full flex flex-col justify-center items-center gap-2 pl-2">
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
                horisontal
                  ? 'w-full  absolute bottom-0 right-0 flex flex-col justify-end items-end gap-2 '
                  : 'w-[100%] flex flex-col justify-end items-end gap-2  '
              "
            >
              <div
                v-if="if_discount && !discount_banner"
                class="w-full flex justify-center items-center p-0 bg-red-400"
              >
                <p
                  v-if="price !== null && discount !== null && price > discount"
                  class="text-md font-semibold text-white"
                >
                  - {{ computedDiscount }}%
                </p>
              </div>
              <div
                v-if="price !== 0"
                :class="['w-full flex items-center gap-4 px-4 ', justifyComputed]"
              >
                <p
                  v-if="price"
                  :class="
                    if_discount && price !== null && discount !== null && price > discount
                      ? 'line-through text-md text-red-500 '
                      : '  text-md py-0 '
                  "
                >
                  {{ price }} €.
                </p>

                <p
                  v-if="discount && price !== null && discount !== null && price > discount"
                  class="text-md"
                >
                  {{ discount }} €.
                </p>
              </div>
              <div v-else class="w-full h-[50px] flex justify-center items-center bg-amber-400">
                <p class="text-lg font-semibold text-white">For free</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
