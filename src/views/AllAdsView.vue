<script setup lang="ts">
import { supabase } from '../lib/supabaseClient'
import { useFilterStore } from '@/stores/filter-store'
import { ref, onMounted, toRefs } from 'vue'
import { RouterLink } from 'vue-router'
import AdCard from '../components/AdCard.vue'
import type { Tables } from '@/types/supabase'
import { Icon } from '@iconify/vue'

import { useWindowSize } from '@/composables/useWindowSize'
import ReusableFilterComponent from '@/components/reusable/ReusableFilterComponent.vue'

const { isPhone } = useWindowSize()

const filterStore = useFilterStore()

const { selectedCategory } = toRefs(filterStore)

const ads = ref<Tables<'ads'>[]>([])
const searchQuery = ref<string>('')
const filteredAds = ref<Tables<'ads'>[]>([])

const getAds = async () => {
  const { data, error } = await supabase.from('ads').select('*')
  if (!error && data) {
    return (ads.value = shuffleArray(data))
  }
}

const shuffleArray = (array: Tables<'ads'>[]): Tables<'ads'>[] => {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

onMounted(async () => {
  await getAds()
})
</script>

<template>
  <div class="bg-gray-50">
    <div
      class="w-full flex justify-start items-center gap-4 pt-8"
      :class="isPhone ? 'px-4' : 'px-20'"
    >
      <Icon icon="famicons:bag" width="40" height="40" class="text-black" />
      <div class="text-3xl font-semibold">Ads</div>
    </div>

    <div class="w-full px-4 pb-8">
      <ReusableFilterComponent
        :items="ads"
        v-model:searchQuery="searchQuery"
        v-model:selectedCategory="selectedCategory"
        @update:filteredItems="filteredAds = $event"
      />
    </div>
    <div :class="isPhone ? 'p-2 w-full ' : ' w-full px-[5%]'">
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
              :img="[ad.img?.[0] || '']"
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
            />
          </RouterLink>
        </div>
      </div>
      <div v-if="filteredAds.length === 0" class="text-center text-2xl font-bold">
        Nothing found
      </div>
      <br /><br /><br /><br />
    </div>
  </div>
</template>
