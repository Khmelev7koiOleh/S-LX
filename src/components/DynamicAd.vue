<!-- src/views/AdDetail.vue -->
<script setup lang="ts">
import { onMounted, ref, toRefs, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import type { AdsType } from '@/types/ads-type'
import Button from './ui/button/Button.vue'
import { useGetUserStore } from '@/stores/current-user-store'
import ChatMessageComponent from './ChatMessageComponent.vue'
import AdCard from './AdCard.vue'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import AddFavoritesButton from './AddFavoritesButton.vue'
import UserProfile from './user-profile/UserProfile.vue'
import { useChatStore } from '@/stores/chat-store'
import { Icon } from '@iconify/vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useWindowSize } from '@/composables/useWindowSize'
const { width, height, isPhone, isTablet, isLaptop } = useWindowSize()
import { useGetAdCategory } from '../composables/get-ad-category'
const chatStore = useChatStore()
const { getValueOf } = useGetAdCategory()
interface CurrentRoom {
  room_id: string
  // Add other properties of currentRoom here
}
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const message = ref('')
// const room = ref('general')
const router = useRouter()
const route = useRoute()
const ad = ref<AdsType | null>(null)
const userData = ref<any | null>(null)
const chat = ref<any | null>(null)
const theMessage = ref<{ msg: string }[]>([])
const currentRoom = ref<any | undefined>(null)
// const onCurrentRoomOpen = ref<boolean>(false)
const klasse = ref<any[] | null>([])
const klasseNew = ref<any[] | null>([])
const adImg = ref<string[] | null>([])
const rating = ref<Number>(0)
const onPhoneNumberShow = ref<boolean>(false)
let ratingSubscription: any = null

async function getOrCreateConversation(user_1, user_2) {
  const sorted = [user_1, user_2].sort() // sorts alphabetically
  const room_id = `${sorted[0]}_${sorted[1]}`

  console.log('room_id', room_id)

  const { data: existingConvo, error } = await supabase
    .from('chat')
    .select('*')

    .eq('room_id', room_id)
    .maybeSingle()
  theMessage.value = existingConvo
  klasse.value = existingConvo

  if (existingConvo) return existingConvo

  // Falls nicht, neuen Chat erstellen
  const { data: newConvo, error: createError } = await supabase
    .from('chat')
    .insert([
      {
        user_name: 'just a name',
        room_id: room_id,
        content: 'text and smth else',
        participants: [user_1, user_2], // [user_1, user_2],
        msg: [{ sender_id: user_1, text: message.value, timestamp: new Date().toISOString() }],
        // msg: [message.value],
      },
    ])
    .select()
    .single()
  console.log('newConvo', newConvo)
  klasseNew.value = newConvo
  return newConvo
}

const getChat = async () => {
  const { data, error } = await supabase.from('chat').select('*')
  if (data) chat.value = data
}

const sendMessageToMessage = async (id: string, message: string) => {
  console.log(id, message)

  const { data, error } = await supabase.from('chat').insert([
    {
      user_name: 'just a namewfwefwgw',
      content: message,
      room_id: ad.value?.user_id + '_' + user.value.id,
      participants: [{ participant_1: user.value.id }, { participant_2: id }],
      check: [{ messages: message }],
    },
  ])
  console.log('data', data)
  if (error) console.error('Error sending message:', error)
}

async function createChatRoom(user1_id: string, user2_id: string) {
  console.log(user1_id, user2_id)
  const room_id = [user1_id, user2_id].sort().join('_')
  const { data, error } = await supabase
    .from('chat_rooms')
    .upsert(
      {
        room_id,
        participant_ids: [user1_id, user2_id],
        room_topic: ad.value?.title,
      },
      { onConflict: 'room_id' },
    )
    .select()
    .single()

  currentRoom.value = data

  return data
}
const getUser = async () => {
  const { data, error } = await supabase.from('user').select('*').eq('id', ad?.value?.user_id)
  if (data && data.length > 0) {
    userData.value = data[0]
  } else {
    // Handle the case where no data is found
    console.log('No user data found')
  }
}
const deleteAd = async (id: string) => {
  const { error } = await supabase.from('ads').delete().eq('id', id)
  if (error) console.log(error)
  else {
    router.push({ name: 'ads' })
  }
}

const getAverageRating = async (targetUserId: any) => {
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

const transformTime = computed(() => {
  if (ad.value?.created_at) {
    const date = new Date(ad.value.created_at)
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return formattedDate
  } else {
    return 'Unknown date'
  }
})

const handleCategory = (category: string) => {
  getValueOf(category)
}
const subscribeToRatings = (targetUserId: any) => {
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
  await getChat()
  const { data, error } = await supabase.from('ads').select('*').eq('id', route.params.id).single()

  if (!error) {
    ad.value = data
    userData.value = data
  }
  await getUser()
  adImg.value = ad.value?.img ? [ad.value?.img] : null
  subscribeToRatings(ad.value?.user_id)
  subscribeToRatings(ad.value?.user_id)

  getAverageRating(ad.value?.user_id)
})
</script>

<template>
  <div class="w-[100vw] h-[100vh] relative">
    <button
      v-if="user?.id === ad?.user_id"
      :class="isPhone ? ' absolute top-2 right-2 ' : 'absolute top-8 right-8'"
    >
      <ConfirmDialog
        message="Are you sure you want to delete this ad?"
        confirmText="Delete"
        cancelText="Cancel"
        item="ad"
        icon="mdi:dots-vertical"
        @confirm="() => deleteAd(ad.id)"
        @cancel="handleCancel"
      />
    </button>

    <div
      v-if="currentRoom && chatStore.onCurrentRoomOpen"
      class="w-1/3 h-full absolute right-0 flex flex-col justify-center items-center"
    >
      <div
        :class="
          isPhone
            ? 'w-[100%] h-1/2 fixed bottom-0 right-0 flex flex-col justify-center items-center z-10'
            : 'w-[30%] h-2/3 fixed bottom-0 right-0 flex flex-col justify-center items-center z-10'
        "
      >
        <ChatMessageComponent :data="currentRoom" :userData="userData" />
      </div>
    </div>

    <div
      :class="
        isPhone
          ? 'w-full flex flex-col justify-center items-center gap-2 px-[5vw] py-[5vh]'
          : 'w-full flex flex-row justify-center items-center gap-8 px-[10vw] py-[5vh]'
      "
      v-if="ad"
    >
      <div v-if="ad.img" class="w-full flex flex-col justify-center items-center">
        <Carousel
          :opts="{
            align: 'start',
            loop: true,
          }"
          :plugins="[
            Autoplay({
              delay: 2000,
            }),
          ]"
          :class="isPhone ? 'relative w-[100vw] max-w-xl' : 'relative w-full max-w-xl'"
        >
          <div class="absolute top-4 right-4 z-10">
            <AddFavoritesButton
              :id="ad.id"
              :img="ad.img[0] ? ad.img[0] : ad.img || ''"
              :title="ad.title"
              :description="ad.description"
              :price="ad.price"
              :if_discount="ad.if_discount"
              :discount="ad.discount"
            />
          </div>
          <CarouselContent>
            <CarouselItem v-for="(item, index) in ad.img" :key="index">
              <div>
                <Card>
                  <CardContent
                    class="max-h-[500px] min-h-[500px] flex aspect-square items-center justify-center"
                  >
                    <img :src="item" alt="" class="max-h-[450px] min-h-[450px] object-cover" />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div :class="isPhone ? 'absolute top-1/2 left-[15%]' : ''">
            <CarouselPrevious />
          </div>
          <div :class="isPhone ? 'absolute top-1/2 right-[15%]' : ''">
            <CarouselNext />
          </div>
        </Carousel>
        <div
          :class="
            isPhone
              ? 'w-[95vw] flex flex-col justify-center items-center gap-2 p-4 shadow m-4 rounded-md '
              : 'w-[80%] flex flex-col justify-center items-center gap-2 p-4 shadow m-4 rounded-md'
          "
        >
          <div class="w-full flex flex-col justify-center items-start gap-6">
            <div class="flex flex-col items-start justify-start">
              <p class="px-2 font-semibold">Title:</p>
              <div class="px-2 font-extralight">{{ ad.title }}</div>
            </div>

            <div class="flex flex-col items-start justify-start">
              <p class="px-2 font-semibold">Description:</p>
              <div class="px-2 font-extralight whitespace-pre-line">{{ ad.description }}</div>
            </div>
            <div class="flex items-center">
              <p class="px-2 font-semibold">Type:</p>
              <Button class="px-2" @click="handleCategory(ad.type)">{{ ad.type }}</Button>
            </div>
            <div class="flex items-center">
              <p class="px-2 font-semibold">Created at:</p>
              <div>{{ transformTime }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-fit flex flex-col justify-center items-center gap-4">
        <div v-for="sm in theMessage" :key="sm.msg">{{ sm }}</div>
      </div>

      <div
        :class="
          isPhone
            ? 'flex flex-col justify-center items-center gap-4 relative shadow'
            : 'flex flex-col justify-center items-center gap-4 relative shadow'
        "
      >
        <div
          :class="
            isPhone
              ? 'w-[95vw] flex flex-col justify-center items-center gap-2 bg-white  p-2 rounded-md'
              : 'w-[400px]  flex flex-col justify-center items-center gap-2 bg-white  p-2 rounded-md'
          "
        >
          <div class="text-xl font-semibold">User</div>

          <RouterLink :to="'/user-profile/' + userData.id">
            <div class="w-full flex flex-col justify-center items-start">
              <div class="flex justify-center items-center gap-2">
                <img
                  :src="userData.img"
                  alt=""
                  width="14"
                  height="14"
                  class="w-14 h-14 object-cover rounded-full"
                />

                <div class="w-full flex flex-col justify-center items-start gap-0">
                  <div class="text-xl">{{ userData.name }}</div>
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
                        :key="i"
                        :icon="icon"
                        width="24"
                        height="24"
                        class="text-yellow-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>
        <div
          :class="
            isPhone
              ? 'w-[95vw]  flex flex-col justify-center items-center gap-2 bg-white  p-2 rounded-md'
              : 'w-[400px]  flex flex-col justify-center items-center gap-2 bg-white  p-2 rounded-md'
          "
        >
          <!-- <RouterLink :to="'/chats/' + ad.user_id"> -->
          <Button
            @click="
              (() => {
                chatStore.onCurrentRoomOpen = true
                createChatRoom(user.id, ad.user_id)
              })()
            "
            class="w-full flex items-center p-2 gap-1 text-black bg-white shadow rounded-lg cursor-pointer hover:text-white"
            >Message</Button
          >
          <!-- </RouterLink> -->
          <Button
            @click="onPhoneNumberShow = !onPhoneNumberShow"
            class="w-full p-2 gap-1 text-black bg-white shadow rounded-lg hover:text-white"
            ><div v-if="!onPhoneNumberShow">Phone number</div>
            <div v-else class="w-full break-words whitespace-normal">
              <div v-if="userData.tel">{{ userData.tel }}</div>
              <div v-else class="text-sm font-light break-words">
                This user has not provided a phone number
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
