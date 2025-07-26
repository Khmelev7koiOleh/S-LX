<script setup lang="ts">
import ChatsComponent from './ChatsComponent.vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { ref, toRefs, onMounted, computed, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '../stores/current-user-store'
import ChatMessageComponent from '@/components/ChatMessageComponent.vue'
import { Icon } from '@iconify/vue'
import UserProfile from './user-profile/UserProfile.vue'
import ReusableUserProfile from './ReusableUserProfile.vue'
import { start } from 'repl'

const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const info = ref<any>({})
const rating = ref<number>(0)

const ratedBy = ref<string[]>([])
const reviews = ref<any>([])

const getRatedBy = async (targetUserId: string) => {
  console.log('getRatedBy', targetUserId)
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('target_user_id', targetUserId)

  if (data) {
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
const computedRating = computed(() => {
  if (!rating.value) return 'This user has not been rated yet'
  return rating.value.toFixed(1) + ' / 5'
})
let ratingSubscription: any = null
const subscribeToRatings = (targetUserId: string) => {
  ratingSubscription = supabase
    .channel('ratings-channel')
    .on(
      'postgres_changes',
      {
        event: '*', // or 'INSERT' | 'UPDATE' | 'DELETE'
        schema: 'public',
        table: 'ratings',
        filter: `target_user_id=eq.${targetUserId}`,
      },
      (payload) => {
        console.log('Realtime change:', payload)
        getAverageRating(targetUserId)
      },
    )
    .subscribe()
}

const unsubscribeFromRatings = async () => {
  if (ratingSubscription) {
    await supabase.removeChannel(ratingSubscription)
  }
}

onMounted(async () => {
  const { data, error } = await supabase.from('user').select('*').eq('id', user.value.id)
  if (data && data.length > 0) {
    info.value = data[0]
  } else {
    // Handle the case where no data is found
    console.log('No user data found')
  }

  subscribeToRatings(info.value.id)
  getRatedBy(user.value.id)
  getAverageRating(info.value.id)
})
onUnmounted(() => {
  // console.log('onUnmounted')
  unsubscribeFromRatings()
})
</script>

<template>
  <div class="w-full flex flex-col mx-auto px-4">
    <div class="w-full flex flex-col gap-4 justify-center items-center p-4">
      <p class="text-sm font-light underline">Ratings and Reviews of you</p>
    </div>
    <div class="w-full flex justify-center items-center">
      <div class="w-full flex justify-center items-center gap-2 bg-amber-400 p-4 rounded-sm">
        <!-- <div class="text-lg font-semibold">Rating:</div> -->
        <div
          :class="
            computedRating == 'This user has not been rated yet'
              ? 'w-full flex flex-col  justify-center items-center gap-6'
              : 'w-full flex  justify-center items-center gap-6'
          "
        >
          <div class="rotate-y-0">
            <Icon
              icon="game-icons:fluffy-wing"
              width="74"
              height="74"
              class="text-amber-300 animate-bounce"
            />
          </div>
          <div
            class="flex flex-row justify-center items-center gap-4 shadow-2xl shadow-white p-2 rounded-2xl"
          >
            <div class="flex flex-col">
              <div class="flex justify-center items-center gap-4">
                <div
                  :class="
                    computedRating == 'This user has not been rated yet'
                      ? 'text-gray-600 text-2xl font-semibold'
                      : 'text-gray-600 text-xl '
                  "
                >
                  {{ computedRating }}
                </div>

                <div class="flex justify-center items-center">
                  <Icon
                    v-for="(icon, i) in computedStars"
                    :key="i"
                    :icon="icon"
                    width="44"
                    height="44"
                    class="text-yellow-400"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="rotate-y-180">
            <Icon
              icon="game-icons:fluffy-wing"
              width="74"
              height="74"
              class="text-amber-300 animate-bounce"
            />
          </div>
        </div>
      </div>
    </div>
    <br />
    <div class="w-full h-full bg-green-400 rounded-sm">
      <div class="w-full flex flex-col justify-center items-center">
        <div class="text-sm font-light text-gray-600 underline p-2">Users that rated you</div>
        <div class="w-full flex flex-col gap-4 justify-center items-center p-4">
          <div v-for="user in info" :key="user" class="w-full">
            <ReusableUserProfile
              v-if="user.user_id"
              :data="user"
              :start="true"
              :center="false"
              :end="false"
              :bg="'bg-gray-50'"
              :router-on="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
