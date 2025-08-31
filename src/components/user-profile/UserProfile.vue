<script setup lang="ts">
import { ref, toRefs, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
// import { useGetUserStore } from '@/stores/current-user-store'
// import type { UserType } from '@/types/user-type'
import type { RealtimeChannel } from '@supabase/supabase-js'
// import { Icon } from '@iconify/vue'
// import ReusableUserProfile from './ReusableUserProfile.vue'
import AdCard from '../AdCard.vue'
import { RouterLink } from 'vue-router'

// import { useChatStore } from '@/stores/chat-store'
// import Button from '../ui/button/Button.vue'
import ReusableUserProfile from '@/components/ReusableUserProfile.vue'
import { getAllAds } from '@/composables/get-ads'
import { useWindowSize } from '@/composables/useWindowSize'
import type { Tables } from '@/types/supabase'
const { isPhone } = useWindowSize()

// const chatStore = useChatStore()
const { fetchAds, ads } = getAllAds()

// const chat = chatStore.currentChat // Always available

// const router = useRouter()
// const userStore = useGetUserStore()
// const { user } = toRefs(userStore)
// const allStars = ref(5)
// const getUser = supabase.auth.getUser()
// const description = ref<string>('')
// const location = ref<string>('')
// const tel = ref<string>('')
// const currentRoom = ref<any | undefined>(null)
// const imageUrl = ref<string>('')
// const file = ref<File | null>(null)
const rating = ref<number>(0)
const info = ref<Tables<'user'>>({
  created_at: '',
  name: '',
  email: '',
  id: '',
  img: '',
  description: '',
  location: '',
  tel: '',
  user_id: '',
})

const props = defineProps({
  id: String,
})
const { id } = toRefs(props)

// const ads = ref<any[]>([])

// const getAds = async () => {
//   console.log(info.value.id)
//   const { data: userAds, error } = await supabase
//     .from('ads')
//     .select('*')
//     .eq('user_id', info.value.id)
//   if (!error && info) {
//     ads.value = userAds.sort((a, b) => {
//       return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//     })

//     console.log(info, 'dataw')
//   }
// }

// const goToChat = (chat: any) => {
//   console.log(chat)
//   chatStore.currentChat = chat // Store the chat
//   router.push(`/chats/${chat.room_id}`) // Navigate
// }
// async function createChatRoom(user1_id: string, user2_id: string, room_topic: string) {
//   console.log(user1_id, user2_id)
//   const room_id = [user1_id, user2_id].sort().join('_') // Eindeutige ID (z. B. "user1_user2")
//   const { data: dataCheck, error } = await supabase
//     .from('chat_rooms')
//     .select('*')
//     .eq('room_id', room_id)
//     .maybeSingle()
//   if (dataCheck) {
//     console.log(user.value)
//     console.log(dataCheck)
//     goToChat(dataCheck)
//   } else {
//     const { data, error } = await supabase
//       .from('chat_rooms')
//       .upsert(
//         {
//           room_id,
//           participant_ids: [user1_id, user2_id],
//           room_topic: dataCheck ? dataCheck.room_topic : info.value.name,
//         },
//         { onConflict: 'room_id' },
//       )
//       .select()
//       .single()
//     currentRoom.value = data
//     console.log(data)
//     if (data) {
//       goToChat(data)
//     }

//     return data
//   }
//   return dataCheck
// }

// ________________________________

// const rateUser = async (targetUserId: string, userId: string, rating: number) => {
//   console.log('rateUser', targetUserId, 'by', userId, 'with rating', rating)
//   const { data: dataGet, error: errorGet } = await supabase
//     .from('ratings')
//     .select('*')
//     .eq('target_user_id', targetUserId)
//     .eq('rated_by', userId)

//   const info = dataGet![0]
//   if (info !== undefined && userId === info.rated_by) {
//     const { data, error } = await supabase
//       .from('ratings')
//       .update({ rating: rating })
//       .eq('target_user_id', targetUserId)
//       .eq('rated_by', userId)

//     if (error) {
//       console.error('Rating error:', error)
//     } else {
//       console.log('Rating saved:', data)
//     }
//     return
//   }
//   const { data, error } = await supabase.from('ratings').insert([
//     {
//       target_user_id: targetUserId,
//       rated_by: userId,
//       rating: rating,
//     },
//   ])

//   if (error) {
//     console.error('Rating error:', error)
//   } else {
//     console.log('Rating saved:', data)
//   }
// }

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
// const computedStars = computed(() => {
//   const stars = []
//   const fullStars = Math.floor(rating.value)
//   const hasHalfStar = rating.value % 1 >= 0.25 && rating.value % 1 <= 0.75
//   const totalStars = 5
//   for (let i = 1; i <= totalStars; i++) {
//     if (i <= fullStars) {
//       stars.push('material-symbols:star')
//     } else if (i === fullStars + 1 && hasHalfStar) {
//       stars.push('material-symbols:star-half')
//     } else {
//       stars.push('material-symbols:star-outline')
//     }
//   }

//   return stars
// })
// const computedRating = computed(() => {
//   if (!rating.value) return 'This user has not been rated yet'
//   return rating.value.toFixed(1) + ' / 5'
// })
let ratingSubscription: RealtimeChannel | null = null
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
  const { data } = await supabase.from('user').select('*').eq('id', id?.value)
  if (data && data.length > 0) {
    info.value = data[0]
  } else {
    // Handle the case where no data is found
    console.log('No user data found')
  }

  subscribeToRatings(info.value.id)
  fetchAds()
  // getAds()
  getAverageRating(info.value.id)
})
onUnmounted(() => {
  // console.log('onUnmounted')
  unsubscribeFromRatings()
})
</script>

<template>
  <div :class="isPhone ? 'p-2 w-full ' : ' w-full px-[5%]'">
    <div class="w-full h-full flex justify-center items-center gap-10">
      <ReusableUserProfile
        v-if="info.user_id"
        :data="info"
        :start="true"
        :center="false"
        :end="false"
        :bg="'bg-transparent'"
        :router-on="false"
        :is_visable="false"
        :main_info="true"
        :main_info_confirm="true"
      />
    </div>
    <div class="w-full border"></div>
    <!-- <div class="p-20">
      {{ ads }}
    </div> -->

    <div class="w-full flex justify-center items-center pb-8 p-2">
      <div class="text-xl text-gray-800 font-mono border-b">{{ info.name }}'s ads</div>
    </div>
    <div
      :class="
        isPhone
          ? ' w-full grid grid-cols-2 justify-center items-center gap-4 '
          : ' w-full grid grid-cols-4 gap-4 justify-center items-center'
      "
    >
      <div v-for="ad in ads" :key="ad.id" class="w-full flex flex-col justify-center items-center">
        <RouterLink :to="`/ad/${ad.id}`">
          <AdCard
            :title="ad.title"
            :description="ad.description"
            :price="ad.price"
            :id="ad.id"
            :img="[ad.img?.[0] || '']"
            :type="ad.type"
            :if_discount="ad.if_discount"
            :discount="ad.discount"
            :h_size="isPhone ? '120px' : '200px'"
            :size="isPhone ? '180px' : '300px'"
            :w_container="isPhone ? '180px' : '300px'"
            :h_container="isPhone ? '250px' : '350px'"
            :horisontal="true"
            :col="true"
            :is_user_name="false"
            :created_at="ad.created_at || ''"
            :if_favorite="true"
          />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
