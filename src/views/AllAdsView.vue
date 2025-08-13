<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'
import { useFilterStore } from '@/stores/filter-store'
import { ref, onMounted, computed, watch, toRefs } from 'vue'
import { RouterLink } from 'vue-router'
import AdCard from '../components/AdCard.vue'

import { adType } from '@/data/ad-type'

import { useWindowSize } from '@/composables/useWindowSize'
import ReusableFilterComponent from '@/components/reusable/ReusableFilterComponent.vue'
import type { AdsType } from '@/types/ads-type'

const { width, height, isPhone, isTablet, isLaptop } = useWindowSize()

const filterStore = useFilterStore()

const { selectedCategory } = toRefs(filterStore)

const ads = ref<any[]>([])
const searchQuery = ref<string>('')
const filteredAds = ref<any[]>([])
// const onFilterOpen = ref<boolean>(false)

// const filterCreatedAt = ref<boolean>(false)
// const filterPrice = ref<boolean>(false)

// Fetch data
const getAds = async () => {
  const { data, error } = await supabase.from('ads').select('*')
  if (!error && data) {
    return (ads.value = shuffleArray(data))
  }
}

// const shuffleArray = (data: any[]) => {
//   return data.sort(() => Math.random() - 0.5)
// }

function shuffleArray(array: AdsType[]): AdsType[] {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
// const filteredItems = computed(() => {
//   let result = [...ads.value]
//   if (searchQuery.value.trim()) {
//     const query = searchQuery.value.toLowerCase()
//     result = result.filter(
//       (ad) =>
//         ad.title.toLowerCase().includes(query) || ad.description.toLowerCase().includes(query),
//     )
//   }
//   if (selectedCategory.value) {
//     result = result.filter((ad) => ad.type === selectedCategory.value)
//   }

//   if (filterCreatedAt.value) {
//     result = result.sort((a, b) => {
//       return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//     })
//   }

//   if (filterPrice.value) {
//     result = result.sort((a, b) => b.price - a.price)
//   }

//   return result
// })

// const toggleCreatedAtSort = () => {
//   filterCreatedAt.value = !filterCreatedAt.value
//   filterPrice.value = false
// }

// const togglePriceSort = () => {
//   filterPrice.value = !filterPrice.value
//   filterCreatedAt.value = false
// }

// const filterRemove = () => {
//   console.log(filteredItems.value)

//   searchQuery.value = ''
//   selectedCategory.value = ''
//   filterCreatedAt.value = false
//   filterPrice.value = false
// }

onMounted(async () => {
  await getAds()
})

// watch(searchQuery, (newQuery) => {
//   if (newQuery) {
//   }

// })
// watch(selectedCategory, (newQuery) => {
//   if (newQuery) {
//     filteredAdsByCategory(newQuery)
//   } else {
//     filteredItems.value = ads.value
//   }
// })
</script>

<template>
  <div class="bg-gray-50">
    <!-- <h1 class="text-2xl px-4 py-2">All ads</h1> -->
    <div class="w-full px-4 py-8">
      <ReusableFilterComponent
        :items="ads"
        v-model:searchQuery="searchQuery"
        v-model:selectedCategory="selectedCategory"
        @update:filteredItems="filteredAds = $event"
      />
    </div>
    <div :class="isPhone ? 'p-2 w-full ' : ' w-full px-[5%] '">
      <div
        :class="
          isPhone
            ? ' w-full grid grid-cols-2 justify-center items-center gap-4 '
            : ' w-full grid grid-cols-4 gap-4 justify-center items-center'
        "
      >
        <div
          v-for="ad in filteredAds"
          :key="ad.id"
          class="w-full flex flex-col justify-center items-center"
        >
          <RouterLink :to="`/ad/${ad.id}`">
            <AdCard
              :title="ad.title"
              :description="ad.description"
              :price="ad.price"
              :id="ad.id"
              :img="ad.img[0] ? ad.img[0] : ad.img || ''"
              :if_discount="ad.if_discount"
              :discount="ad.discount"
              :type="ad.type"
              :h_size="isPhone ? '120px' : '200px'"
              :size="isPhone ? '180px' : '300px'"
              :w_container="isPhone ? '180px' : '300px'"
              :h_container="isPhone ? '250px' : '350px'"
              :horisontal="true"
              :col="true"
              :created_at="ad.created_at"
              :if_favorite="true"
              :is_user_name="false"
              :user_name="ad.user_name"
            />
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
