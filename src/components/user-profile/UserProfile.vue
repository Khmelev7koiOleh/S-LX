<script setup lang="ts">
import { ref, toRefs, onMounted, onUnmounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '@/stores/current-user-store'
import type { UserType } from '@/types/user-type'

import { Icon } from '@iconify/vue'
// import ReusableUserProfile from './ReusableUserProfile.vue'
import AdCard from '../AdCard.vue'
import { RouterLink, useRouter } from 'vue-router'

import { useChatStore } from '@/stores/chat-store'
import Button from '../ui/button/Button.vue'

const chatStore = useChatStore()

const chat = chatStore.currentChat // Always available

const router = useRouter()
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const allStars = ref(5)
const getUser = supabase.auth.getUser()
const description = ref<string>('')
const location = ref<string>('')
const tel = ref<string>('')
const currentRoom = ref<any | undefined>(null)
const imageUrl = ref<string>('')
const file = ref<File | null>(null)
const rating = ref<Number>(0)
const info = ref<UserType>({
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

const ads = ref<any[]>([])

const getAds = async () => {
  console.log(info.value.id)
  const { data: userAds, error } = await supabase
    .from('ads')
    .select('*')
    .eq('user_id', info.value.id)
  if (!error && info) {
    ads.value = userAds.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    console.log(info, 'dataw')
  }
}

const goToChat = (chat: any) => {
  console.log(chat)
  chatStore.currentChat = chat // Store the chat
  router.push(`/chats/${chat.room_id}`) // Navigate
}
async function createChatRoom(user1_id: string, user2_id: string, room_topic: string) {
  console.log(user1_id, user2_id)
  const room_id = [user1_id, user2_id].sort().join('_') // Eindeutige ID (z. B. "user1_user2")
  const { data: dataCheck, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('room_id', room_id)
    .maybeSingle()
  if (dataCheck) {
    console.log(user.value)
    console.log(dataCheck)
    goToChat(dataCheck)
  } else {
    const { data, error } = await supabase
      .from('chat_rooms')
      .upsert(
        {
          room_id,
          participant_ids: [user1_id, user2_id],
          room_topic: dataCheck ? dataCheck.room_topic : info.value.name,
        },
        { onConflict: 'room_id' },
      )
      .select()
      .single()
    currentRoom.value = data
    console.log(data)
    if (data) {
      goToChat(data)
    }

    return data
  }
  return dataCheck
}

const rateUser = async (targetUserId: string, userId: string, rating: number) => {
  console.log('rateUser', targetUserId, 'by', userId, 'with rating', rating)
  const { data: dataGet, error: errorGet } = await supabase
    .from('ratings')
    .select('*')
    .eq('target_user_id', targetUserId)
    .eq('rated_by', userId)

  const info = dataGet![0]
  if (info !== undefined && userId === info.rated_by) {
    const { data, error } = await supabase
      .from('ratings')
      .update({ rating: rating })
      .eq('target_user_id', targetUserId)
      .eq('rated_by', userId)

    if (error) {
      console.error('Rating error:', error)
    } else {
      console.log('Rating saved:', data)
    }
    return
  }
  const { data, error } = await supabase.from('ratings').insert([
    {
      target_user_id: targetUserId,
      rated_by: userId,
      rating: rating,
    },
  ])

  if (error) {
    console.error('Rating error:', error)
  } else {
    console.log('Rating saved:', data)
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
  const { data, error } = await supabase.from('user').select('*').eq('id', id?.value)
  if (data && data.length > 0) {
    info.value = data[0]
  } else {
    // Handle the case where no data is found
    console.log('No user data found')
  }

  subscribeToRatings(info.value.id)

  getAds()
  getAverageRating(info.value.id)
})
onUnmounted(() => {
  // console.log('onUnmounted')
  unsubscribeFromRatings()
})
</script>

<template>
  <!-- <div class="bg-fuchsia-400">{{ user.id }}</div>
  <div>{{ id }}</div>
  <div class="bg-blue-400">{{ info }}</div>
  <div class="bg-red-400"></div>

  <div class="w-full flex justify-start items-start relative">
    <div class="w-1/2 flex justify-center items-center bg-amber-500">
      <div>
        <img
          :src="info.img"
          alt=""
          width="50"
          height="50"
          class="border border-black w-[150px] h-[150px] rounded-full"
        />
      </div>
    </div>
    <div class="text-black w-1/2 p-4">
      <div class="flex flex-col justify-start items-start gap-8">
        <div class="flex justify-start items-center gap-2">
          <div class="text-md font-semibold text-gray-600">Main information</div>
          <Icon icon="mdi:eye" width="20" height="20" />
        </div>
        <div class="flex flex-col gap-4 px-4">
          <div class="flex flex-col gap-2">
            <p class="text-gray-800 text-sm font-extralight">Description</p>
            <p v-if="info.description == ''" class="px-4">there is no description</p>
            <p v-else class="px-4">{{ info.description }}</p>
          </div>
          <div class="flex flex-col gap-4">
            <p class="text-gray-800 text-sm font-extralight">Location</p>
            <p v-if="info.location == ''" class="px-4">there is no location</p>
            <p v-else class="px-4">{{ info.location }}</p>
          </div>
          <div class="flex flex-col gap-4">
            <p class="text-gray-800 text-sm font-extralight">Tel</p>
            <p v-if="info.tel == ''" class="px-4">there is no tel</p>
            <p v-else class="px-4">{{ info.tel }}</p>
          </div>
        </div>
      </div>
    </div>
  </div> -->

  <!-- <div>{{ data }}</div> -->

  <div class="min-w-[100vw] w-full min-h-[100vh] h-full bg-gray-50 p-10">
    <div class="w-full h-full flex justify-center items-center gap-10">
      <div class="">
        <div class="flex justify-center items-center gap-4">
          <div class="">
            <img
              :src="info.img"
              class="rounded-full object-cover w-[150px] h-[150px]"
              width="150"
              height="150"
              alt=""
            />
            <!-- <div>{{ user.id }}</div> -->
          </div>
          <div class="flex flex-col justify-center items-start gap-2">
            <div class="text-xl text-gray-800 font-mono">{{ info.name }}</div>
            <div class="text-md text-gray-800 font-mono">{{ info.email }}</div>

            <div class="w-full flex justify-start items-center gap-2">
              <!-- <div class="text-lg font-semibold">Rating:</div> -->
              <div
                :class="
                  computedRating == 'This user has not been rated yet'
                    ? 'w-full flex flex-col  justify-start items-center gap-2'
                    : 'w-full flex  justify-start items-center gap-2'
                "
              >
                <div
                  :class="
                    computedRating == 'This user has not been rated yet'
                      ? 'text-gray-800 text-md font-semibold'
                      : 'text-gray-800'
                  "
                >
                  {{ computedRating }}
                </div>
                <div class="flex justify-start items-center">
                  <Icon
                    v-for="(icon, i) in computedStars"
                    @click="rateUser(info.id, user.id, i + 1)"
                    :key="i"
                    :icon="icon"
                    width="24"
                    height="24"
                    class="text-yellow-400"
                  />
                </div>
              </div>
            </div>
            <!-- :icon="i > rating ? 'mdi:star-outline' : 'mdi:star'" -->
            <!-- <div class="text-md text-gray-800 font-mono">{{ info }}</div> -->
          </div>
        </div>
        <!-- {{ user.id }}
        <br />
        {{ info.id }}
        <br />
        {{ chat.room_topic }} -->
        <div class="w-full flex justify-end items-center p-4">
          <Button @click="createChatRoom(user.id, info.id, chat.room_topic)" class="">
            <div class="text-md text-gray-300 font-mono">Chat with {{ info.name }}</div>
            <Icon icon="material-symbols:chat" width="24" height="24" />
          </Button>
        </div>
      </div>

      <div class="flex justify-center items-start relative">
        <div v-if="info" class="text-black p-4">
          <div class="flex flex-col justify-start items-start gap-8">
            <div class="flex justify-start items-center gap-2">
              <div class="text-md font-semibold text-gray-600">Main information</div>
              <Icon icon="mdi:eye" width="20" height="20" />
            </div>
            <div class="flex flex-col gap-4 px-4">
              <div class="flex justify-start items-center gap-2">
                <p class="text-gray-800">Description:</p>
                <p v-if="info.description == null" class="px-4 text-sm font-extralight">
                  there is no description
                </p>
                <p v-else class="px-4 text-sm font-extralight">{{ info.description }}</p>
              </div>
              <div class="flex justify-start items-center gap-4">
                <p class="text-gray-800">Location:</p>
                <p v-if="info.location == null" class="px-4 text-sm font-extralight">
                  there is no location
                </p>
                <p v-else class="px-4 text-sm font-extralight">{{ info.location }}</p>
              </div>
              <div class="flex justify-start items-center gap-4">
                <p class="text-gray-800">Tel:</p>
                <p v-if="info.tel == null" class="px-4 text-sm font-extralight">there is no tel</p>
                <p v-else class="px-4 text-sm font-extralight">{{ info.tel }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full border"></div>
    <!-- <div class="p-20">
      {{ ads }}
    </div> -->

    <div class="w-full flex justify-center items-center p-4">
      <div class="text-xl text-gray-800 font-mono border-b">{{ info.name }} ads</div>
    </div>
    <div class="p-10 w-full flex flex-wrap justify-start items-center gap-8">
      <div v-for="ad in ads" :key="ad.id">
        <RouterLink :to="`/ad/${ad.id}`">
          <AdCard
            :title="ad.title"
            :description="ad.description"
            :price="ad.price"
            :id="ad.id"
            :img="ad.img[0] || ''"
            :user_name="ad.user_name"
            :type="ad.type"
            :if_discount="ad.if_discount"
            :discount="ad.discount"
            :h_size="'200px'"
            :size="'300px'"
            :w_container="'300px'"
            :h_container="'350px'"
            :horisontal="true"
            :col="true"
            :is_user_name="false"
            :created_at="ad.created_at || ''"
            :if_favorite="false"
          />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
