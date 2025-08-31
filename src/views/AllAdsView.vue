<script setup lang="ts">
// import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'
import { useFilterStore } from '@/stores/filter-store'
import { ref, onMounted, toRefs } from 'vue'
import { RouterLink } from 'vue-router'
import AdCard from '../components/AdCard.vue'
import type { Tables } from '@/types/supabase'

// import { adType } from '@/data/ad-type'
// import { useRoute } from 'vue-router'
// import { useGetUserStore } from '../stores/current-user-store'
import { useWindowSize } from '@/composables/useWindowSize'
import ReusableFilterComponent from '@/components/reusable/ReusableFilterComponent.vue'

const { isPhone } = useWindowSize()

// const userStore = useGetUserStore()
// const { user } = toRefs(userStore)
const filterStore = useFilterStore()

const { selectedCategory } = toRefs(filterStore)
// const route = useRoute()
const ads = ref<Tables<'ads'>[]>([])
const searchQuery = ref<string>('')
const filteredAds = ref<Tables<'ads'>[]>([])
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

const shuffleArray = (array: Tables<'ads'>[]): Tables<'ads'>[] => {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// const getFavorites = async (id: string) => {
//   // console.log(ad_id)
//   const { data, error } = await supabase
//     .from('favorites')
//     .select('id')
//     .eq('id', id)
//     .eq('user_id', user.value.id)
//     .maybeSingle()

//   // console.log(data)
//   if (route.name === 'favorites ' && !error) {
//     isFavorite.value = true
//   } else {
//     isFavorite.value = !!data
//   }
// }

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
// let ratingSubscription: any = null
// const subscribeToFavorites = (targetUserId: any) => {
//   ratingSubscription = supabase
//     .channel('ratings-channel')
//     .on(
//       'postgres_changes',
//       {
//         event: '*', // or 'INSERT' | 'UPDATE' | 'DELETE'
//         schema: 'public',
//         table: 'ratings',
//         filter: `user_id=eq.${targetUserId}`,
//       },
//       (payload) => {
//         console.log('Realtime change:', payload)
//         getAverageRating(targetUserId)
//       },
//     )
//     .subscribe()
// }
// const unsubscribeFromFavorites = async () => {
//   if (ratingSubscription) {
//     await supabase.removeChannel(ratingSubscription)
//   }
// }

// onMounted(async () => {
//   await getChat()
//   const { data, error } = await supabase.from('ads').select('*').eq('id', route.params.id).single()

//   if (!error) {
//     ad.value = data
//     userData.value = data
//   }
//   await getUser()
//   adImg.value = ad.value?.img ? [ad.value?.img] : null
//   subscribeToRatings(ad.value?.user_id)

//   getAverageRating(ad.value?.user_id)
// })

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
    </div>
  </div>
</template>
