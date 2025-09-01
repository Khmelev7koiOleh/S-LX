<script setup lang="ts">
// import ChatsComponent from './ChatsComponent.vue'
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination'

import { ref, toRefs, onMounted, computed, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '../stores/current-user-store'
// import ChatMessageComponent from '@/components/ChatMessageComponent.vue'
import { Icon } from '@iconify/vue'
// import UserProfile from './user-profile/UserProfile.vue'
import ReusableUserProfile from './reusable/ReusableUserProfile.vue'
// import { start } from 'repl'
// import { styleText } from 'util'
// import ReusableFilterComponent from './reusable/ReusableFilterComponent.vue'
// import { useFilterStore } from '../stores/filter-store'
import { Button } from '@/components/ui/button'
import { useSupabaseSubscription } from '@/composables/useSupabaseSubscription'
import { useWindowSize } from '@/composables/useWindowSize'
import type { Tables } from '@/types/supabase'

const { isPhone } = useWindowSize()
const { subscribe, unsubscribe } = useSupabaseSubscription()
// const filterStore = useFilterStore()

// const { selectedCategory } = toRefs(filterStore)
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const info = ref<Tables<'user'>[]>([])
const rating = ref<number>(0)
const fullRating = ref<number[]>([])
const ratedBy = ref<string[]>([])
// const reviews = ref<any>([])

const getRatedBy = async (targetUserId: string) => {
  console.log('getRatedBy', targetUserId)
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('target_user_id', targetUserId)

  if (data) {
    // fullRating.value = data
    fullRating.value = data.map((rating) => rating.rating)
    ratedBy.value = data.map((rating) => rating.rated_by)
    const { data: ratedByUsersData, error: ratedByUsersError } = await supabase
      .from('user')
      .select('*')
      .in('user_id', ratedBy.value)

    if (ratedByUsersError) {
      console.log(ratedByUsersError)
    } else {
      info.value = ratedByUsersData
    }
  } else {
    console.log(error)
  }
}
const getAverageRating = async (targetUserId: string) => {
  console.log('getAverageRating', targetUserId)

  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('target_user_id', targetUserId)
  if (data) {
    rating.value = data.reduce((acc, rating) => acc + rating.rating, 0) / data.length
  } else {
    console.log(error)
  }
}
const computedStars = computed(() => {
  const stars = []
  const fullStars = Math.floor(rating.value)
  const hasHalfStar = rating.value % 1 >= 0.25 && rating.value % 1 <= 0.75
  const totalStars = 5
  for (let i = 1; i <= totalStars; i++) {
    if (i <= fullStars) {
      stars.push('material-symbols:star')
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push('material-symbols:star-half')
    } else {
      stars.push('material-symbols:star-outline')
    }
  }

  return stars
})

const computedRatingScore = computed(() => {
  // Create rating distribution for stars 1–5
  const distribution = [1, 2, 3, 4, 5].map((star) => {
    const count = fullRating.value.filter((r) => r === star).length
    return { star, count }
  })

  // Total number of ratings
  const totalCount = fullRating.value.length || 1

  // Sort stars high→low and calculate percentage of total
  return distribution
    .sort((a, b) => b.star - a.star)
    .map((d) => ({
      ...d,
      percent: (d.count / totalCount) * 100, // <-- now percentage of ALL ratings
    }))
})

const computedRating = computed(() => {
  if (rating.value === 0 || undefined || null) return ''
  if (rating.value) return rating.value.toFixed(1)
  else if (!rating.value) return 'You have not been rated yet'
  else return ''
})

// let ratingSubscription: any = null
// const subscribeToRatings = (targetUserId: string) => {
//   ratingSubscription = supabase
//     .channel('ratings-channel')
//     .on(
//       'postgres_changes',
//       {
//         event: '*', // or 'INSERT' | 'UPDATE' | 'DELETE'
//         schema: 'public',
//         table: 'ratings',
//         filter: `target_user_id=eq.${targetUserId}`,
//       },
//       (payload) => {
//         console.log('Realtime change:', payload)
//         getAverageRating(targetUserId)
//       },
//     )
//     .subscribe()
// }

// const unsubscribeFromRatings = async () => {
//   if (ratingSubscription) {
//     await supabase.removeChannel(ratingSubscription)
//   }
// }
// const searchQuery = ref<string>('')
// const filteredAds = ref<any[]>([])
// onMounted(async () => {
//   const { data, error } = await supabase.from('user').select('*').eq('id', user.value.id)
//   if (data && data.length > 0) {
//     info.value = data[0]
//   } else {
//     // Handle the case where no data is found
//     console.log('No user data found')
//   }

//   subscribeToRatings(info.value.id)
//   getRatedBy(user.value.id)
//   getAverageRating(info.value.id)
// })
onMounted(async () => {
  subscribe(
    {
      event: '*',
      schema: 'public',
      table: 'ratings',
      filter: `target_user_id=eq.${user.value.id}`,
    },
    (payload) => {
      console.log('Realtime change:', payload)
      getAverageRating(user.value.id)
      getRatedBy(user.value.id)
    },
  )
  getAverageRating(user.value.id)
  getRatedBy(user.value.id)
})
onUnmounted(() => {
  // console.log('onUnmounted')
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <div class="w-full flex flex-col mx-auto">
    <div class="w-full flex flex-col gap-4 justify-center items-center p-4"></div>
    <div class="w-full flex justify-center items-center">
      <div class="w-full flex justify-center items-center gap-2 p-2 md:p-4 rounded-sm">
        <!-- <div class="text-lg font-semibold">Rating:</div> -->
        <!-- <div
          :class="
            computedRating == 'This user has not been rated yet'
              ? 'w-full flex  justify-center items-center gap-6'
              : 'w-full flex  justify-center items-center gap-4  md:gap-6'
          "
        >
          <div class="rotate-y-0">
            <Icon
              icon="game-icons:fluffy-wing"
              :width="isPhone ? 50 : 74"
              :height="isPhone ? 50 : 74"
              class="text-amber-200 animate-bounce"
            />
          </div>
          <div
            class="flex flex-row justify-center items-center gap-4 bg-white shadow-[0px_0px_40px_20px] shadow-white p-2 rounded-2xl"
          >
            <div class="flex flex-col">
              <div
                :class="
                  computedRating == 'You have not been rated yet'
                    ? 'flex flex-col justify-center items-center'
                    : 'flex justify-center items-center '
                "
                class="flex justify-center items-center gap-2 md:gap-4"
              >
                <div
                  :class="
                    computedRating == 'You have not been rated yet'
                      ? ' text-amber-400 text-2xl font-semibold'
                      : ' text-amber-400 text-md md:text-xl '
                  "
                >
                  {{ computedRating }}
                </div>

                <div class="flex justify-center items-center">
                  <Icon
                    v-for="(icon, i) in computedStars"
                    :key="i"
                    :icon="icon"
                    :width="isPhone ? 30 : 44"
                    :height="isPhone ? 30 : 44"
                    class="text-yellow-300"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="rotate-y-180">
            <Icon
              icon="game-icons:fluffy-wing"
              :width="isPhone ? 50 : 74"
              :height="isPhone ? 50 : 74"
              class="text-amber-200 animate-bounce"
            />
          </div>
        </div> -->
        <div
          :class="
            isPhone
              ? 'w-full h-fit flex flex-col justify-start items-center gap-8 px-4 py-4 '
              : 'w-full h-fit flex justify-center items-start gap-8 px-4 py-4'
          "
        >
          <div
            :class="
              computedRating == 'You have not been rated yet'
                ? 'flex flex-col justify-center items-center'
                : 'flex flex-col justify-center items-start '
            "
            class="flex justify-center items-center gap-2 md:gap-4"
          >
            <div
              :class="
                computedRating == 'You have not been rated yet'
                  ? ' text-amber-400 text-xl font-semibold px-4'
                  : '  px-4 flex justify-center items-center  gap-1'
              "
            >
              <p class="text-gray-900 text-xl md:text-xl font-semibold">{{ computedRating }}</p>
              <p
                v-if="computedRating != 'You have not been rated yet'"
                class="text-gray-600 text-2xl md:text-2xl font-light"
              >
                /
              </p>
              <p
                v-if="computedRating != 'You have not been rated yet'"
                class="text-gray-900 text-md md:text-md font-semibold self-end"
              >
                5
              </p>
            </div>

            <div class="flex justify-center items-center">
              <Icon
                v-for="(icon, i) in computedStars"
                :key="i"
                :icon="icon"
                :width="isPhone ? 40 : 30"
                :height="isPhone ? 40 : 30"
                class="text-yellow-300"
              />
            </div>
            <div class="w-fit flex justify-center items-center gap-2 px-4">
              <p class="font-light text-md">{{ fullRating.length }}</p>
              <p class="font-light text-md">Ratings</p>
            </div>
          </div>

          <div class="h-full border border-gray-300"></div>

          <div class="space-y-2">
            <div
              v-for="item in computedRatingScore"
              :key="item.star"
              class="flex items-center space-x-2"
            >
              <div class="w-[40px] text-right flex justify-center items-center gap-1">
                <p>{{ item.star }}</p>
                <Icon icon="mdi:star" width="25" height="25" class="text-yellow-300" />
              </div>
              <div
                :class="isPhone ? 'w-[70vw]' : 'w-[350px]'"
                class="flex-1 bg-gray-200 rounded h-4 relative"
              >
                <div
                  class="absolute top-0 left-0 h-4 bg-yellow-400 rounded"
                  :style="{ width: item.percent + '%' }"
                ></div>
              </div>
              <div class="w-8 text-left">{{ item.count }}</div>
            </div>
          </div>
          <div class="w-fit flex flex-col justify-start items-start gap-6">
            <p class="text-lg font-semibold">Customer's Reviews</p>
            <div class="w-full flex justify-center items-center gap-4 px-6">
              <Button> Quality of service</Button>
              <Button> Appropriate price</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="text-sm self-center font-light text-gray-600 underline p-2">
      Users that rated you
    </div>

    <!-- <div class="w-full px-4 py-8">
      <ReusableFilterComponent
        :items="info"
        v-model:searchQuery="searchQuery"
        v-model:selectedCategory="selectedCategory"
        @update:filteredItems="filteredAds = $event"
      />
    </div> -->

    <div class="w-full rounded-sm">
      <div
        v-if="info.length == 0"
        class="w-full flex justify-center items-center text-xl font-semibold"
      >
        Nobody has rated you yet
      </div>
      <div class="w-full flex flex-col justify-center items-center">
        <div class="w-[90%] gap-4 justify-start items-center flex flex-wrap">
          <div v-for="user in info" :key="user.user_id" class="w-auto">
            <ReusableUserProfile
              v-if="user.user_id"
              :data="user"
              :start="true"
              :center="false"
              :end="false"
              :bg="'bg-gray-50'"
              :router-on="true"
              :is_visable="true"
              :main_info="true"
              :main_info_confirm="false"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="p-4" />
  </div>
</template>

<style scoped></style>
