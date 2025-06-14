<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'
import { useFilterStore } from '@/stores/filter-store'
import { ref, onMounted, computed, watch, toRefs } from 'vue'
import { RouterLink } from 'vue-router'
import AdCard from '../components/AdCard.vue'

import { adType } from '@/data/ad-type'

const filterStore = useFilterStore()

const { selectedCategory } = toRefs(filterStore)

const ads = ref<any[]>([])
const searchQuery = ref<string>('')

const onFilterOpen = ref<boolean>(false)

const filterCreatedAt = ref<boolean>(false)
const filterPrice = ref<boolean>(false)

// Fetch data
const getAds = async () => {
  const { data, error } = await supabase.from('ads').select('*')
  if (!error && data) {
    ads.value = data.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    console.log(data)
  }
}
const filteredItems = computed(() => {
  let result = [...ads.value]
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (ad) =>
        ad.title.toLowerCase().includes(query) || ad.description.toLowerCase().includes(query),
    )
  }
  if (selectedCategory.value) {
    result = result.filter((ad) => ad.type === selectedCategory.value)
  }

  if (filterCreatedAt.value) {
    result = result.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  if (filterPrice.value) {
    result = result.sort((a, b) => b.price - a.price)
  }

  return result
})

const toggleCreatedAtSort = () => {
  filterCreatedAt.value = !filterCreatedAt.value
  filterPrice.value = false
}

const togglePriceSort = () => {
  filterPrice.value = !filterPrice.value
  filterCreatedAt.value = false
}

const filterRemove = () => {
  console.log(filteredItems.value)

  searchQuery.value = ''
  selectedCategory.value = ''
  filterCreatedAt.value = false
  filterPrice.value = false
}

onMounted(async () => {
  await getAds()

  // mapAds()
})

watch(searchQuery, (newQuery) => {
  if (newQuery) {
  }
  // else {
  //   filteredItems.value = ads.value
  // }
})
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
    <h1 class="text-2xl">About</h1>
    <div class="w-full flex flex-col justify-start items-end gap-2 p-4">
      <!-- <div class="w-full flex justify-end">
      <button class="p-2 bg-fuchsia-500" @click="onFilterOpen = !onFilterOpen">Filter</button>
    </div> -->
      <div class="w-full flex justify-center items-center gap-2">
        <div
          class="w-[300px] flex justify-between bg-fuchsia-950 text-amber-50 placeholder:text-amber-100 px-2 py-1 rounded-lg"
        >
          <Icon icon="mdi:magnify" width="24" height="24" class="text-white" />
          <input
            placeholder="Search"
            type="text"
            v-model="searchQuery"
            :class="
              onFilterOpen
                ? ' focus:outline-none focus:ring-0 '
                : ' focus:outline-none focus:ring-0 '
            "
          />
        </div>

        <select v-model="selectedCategory" class="bg-fuchsia-950 text-gray-300 max-w-[300px] px-2">
          <option disabled value="">Select type</option>
          <option v-for="type in adType" :key="type.value" :value="type.value">
            {{ type.title }}
          </option>
        </select>
        <div
          class="w-[300px] flex justify-center bg-fuchsia-950 text-amber-50 placeholder:text-amber-100"
        >
          <button class="text-center" @click="toggleCreatedAtSort">Date</button>
        </div>
        <div
          class="w-[300px] flex justify-center bg-fuchsia-950 text-amber-50 placeholder:text-amber-100"
        >
          <button class="" @click="togglePriceSort">Price</button>
        </div>

        <div
          class="w-[300px] flex justify-center bg-fuchsia-950 text-amber-50 placeholder:text-amber-100"
        >
          <button class="" @click="filterRemove">Remove Filter</button>
        </div>

        <!-- <button @click="filteredAdsByPriceTwo()">click</button> -->
      </div>
    </div>

    <div class="p-20 w-full">
      <div class="grid grid-cols-4 justify-center items-center gap-20">
        <div v-for="ad in filteredItems" :key="ad.id">
          <RouterLink :to="`/ad/${ad.id}`">
            <AdCard
              :title="ad.title"
              :description="ad.description"
              :price="ad.price"
              :id="ad.id"
              :img="ad.img || ''"
              :type="ad.type"
              :h_size="'200px'"
              :size="'300px'"
              :w_container="'300px'"
              :h_container="'350px'"
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
