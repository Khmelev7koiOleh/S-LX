<!-- src/views/AdDetail.vue -->
<script setup lang="ts">
import { onMounted, ref, toRefs } from 'vue'
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

const chatStore = useChatStore()

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

async function getOrCreateConversation(user_1, user_2) {
  const sorted = [user_1, user_2].sort() // sorts alphabetically
  const room_id = `${sorted[0]}_${sorted[1]}`
  // console.log(`${user_2 + '_' + user_1}`)
  // console.log(`${user_1 + '_' + user_2}`)

  console.log('room_id', room_id)

  const { data: existingConvo, error } = await supabase
    .from('chat')
    .select('*')
    // .or(`and(room_id.eq.${user_1 + '_' + user_2}), and(room_id.eq.${user_2 + '_' + user_1})`)
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

const startChat = async (currentUser: string, otherUser: string) => {
  console.log(currentUser, otherUser)
  // Chat-Raum erstellen/laden
  const conversation = await getOrCreateConversation(currentUser, otherUser)

  // // Nachrichten abonnieren
  // subscribeToConversation(conversation.id, (newMessage) => {
  //   console.log("Neue Nachricht:", newMessage);
  // });

  // // Beispiel: Nachricht senden
  // await sendMessage(conversation.id, currentUser.id, "Hallo!");
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
  // Chat-Raum erstellen/laden
  // // Nachrichten abonnieren
  // subscribeToConversation(conversation.id, (newMessage) => {
  //   console.log("Neue Nachricht:", newMessage);
  // });

  // // Beispiel: Nachricht senden
  // await sendMessage(conversation.id, currentUser.id, "Hallo!");
}

async function createChatRoom(user1_id: string, user2_id: string) {
  console.log(user1_id, user2_id)
  const room_id = [user1_id, user2_id].sort().join('_') // Eindeutige ID (z. B. "user1_user2")

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
    router.push({ name: 'about' })
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
})

// // Nachrichten abonnieren
// function subscribeToMessages(room, callback) {
//   return supabase
//     .channel('messages')
//     .on(
//       'postgres_changes',
//       {
//         event: 'INSERT',
//         schema: 'public',
//         table: 'messages',
//         filter: `room_id=eq.${room}`,
//       },
//       (payload) => callback(payload.new),
//     )
//     .subscribe()
// }

// // Beispiel-Nutzung
// const exampleUser = { id: '123', username: 'max' }

// // Auf neue Nachrichten hören
// subscribeToMessages('general', (message) => {
//   console.log('Neue Nachricht:', message)
// })

// // Nachricht senden
// sendMessage(exampleUser, 'Hallo Welt!')

// // const startChat = (val: string) => {
// //   console.log('start chat with', val)
// //   console.log('my id is', user.value.id)
// // }
</script>

<template>
  <div class="w-[100vw] h-[100vh] relative">
    <Button v-if="user?.id === ad?.user_id" class="absolute top-8 right-8 bg-gray-900 rounded-md">
      <!-- Delete this ad
      <Icon icon="mdi:trash-can" class="w-[20px] h-[20px] text-red-500" /> -->
      <ConfirmDialog
        message="Are you sure you want to delete this ad?"
        confirmText="Delete"
        cancelText="Cancel"
        item="ad"
        icon="mdi:dots-vertical"
        @confirm="() => deleteAd(ad.id)"
        @cancel="handleCancel"
      />
    </Button>

    <!-- <div v-if="currentRoom" class="bg-black text-white p-4">
      <RouterLink :to="'/chats/' + currentRoom?.room_id"> to {{ currentRoom.room_id }} </RouterLink>
    </div> -->
    <div
      v-if="currentRoom && chatStore.onCurrentRoomOpen"
      class="w-1/3 h-full absolute right-0 flex flex-col justify-center items-center"
    >
      <div
        class="w-1/5 h-2/3 fixed bottom-0 right-0 flex flex-col justify-center items-center z-10"
      >
        <ChatMessageComponent :data="currentRoom" />
      </div>
    </div>
    <!-- <div>check if the chat exists , if no create it if yes updade it</div> -->

    <!-- <div class="bg-red-400">{{ getOrCreateConversation }}</div> -->

    <div class="flex flex-row justify-between items-center gap-8 p-20" v-if="ad">
      <!-- <AdCard
        :title="ad.title"
        :description="ad.description"
        :price="ad.price"
        :id="ad.id"
        :img="ad.img || ''"
        :user_name="ad.user_name"
        :type="ad.type"
        :h_size="'auto'"
        :size="'500px'"
        :w_container="'500px'"
        :h_container="'auto'"
        :horisontal="true"
        :col="true"
        :is_user_name="false"
        :created_at="ad.created_at || ''"
        :if_favorite="false"
      /> -->

      <div v-if="ad.img" class="w-full flex flex-col justify-center items-center bg-gray-50">
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
          class="relative w-full max-w-xl"
        >
          <CarouselContent>
            <CarouselItem v-for="(item, index) in ad.img" :key="index">
              <div class="p-1">
                <Card>
                  <CardContent class="flex aspect-square items-center justify-center p-6">
                    <img :src="item" alt="" />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div class="flex justify-center items-center gap-2 p-4 bg-gray-200 m-4">
          <div class="text-xl font-semibold">Description:</div>
          <div class="px-2">{{ ad.description }}</div>
        </div>
      </div>

      <div class="flex flex-col justify-center items-center gap-4">
        <div v-for="sm in theMessage" :key="sm.msg">{{ sm }}</div>
      </div>

      <div class="flex flex-col justify-center items-center gap-4 relative">
        <div class="w-[300px] flex flex-col justify-center items-center gap-2 bg-gray-200 p-8">
          <div class="absolute top-2 right-2">
            <AddFavoritesButton
              :id="ad.id"
              :img="ad.img"
              :title="ad.title"
              :description="ad.description"
              :price="ad.price"
            />
          </div>
          <div class="text-lg font-normal">{{ ad.title }}</div>
          <!-- <RouterLink :to="'/chats/' + ad.user_id"> -->
          <Button
            @click="
              (() => {
                createChatRoom(user.id, ad.user_id)
                chatStore.onCurrentRoomOpen = !chatStore.onCurrentRoomOpen
              })()
            "
            class="w-full flex items-center p-2 gap-1 text-black bg-white shadow rounded-lg cursor-pointer hover:text-white"
            >Message</Button
          >
          <!-- </RouterLink> -->
          <Button
            class="w-full flex items-center p-2 gap-1 text-black bg-white shadow rounded-lg hover:text-white"
            >Phone number</Button
          >
        </div>

        <div class="w-[300px] flex flex-col justify-center items-center gap-2 bg-gray-200 p-2">
          <div class="text-xl font-semibold">User</div>
          <!-- <Button
            @click="
              (() => {
                createChatRoom(user.id, ad.user_id)
                onCurrentRoomOpen = !onCurrentRoomOpen
              })()
            "
            class="w-full flex items-center p-2 gap-1 text-white rounded-lg cursor-pointer"
            >Message</Button
          > -->
          <RouterLink :to="'/user-profile/' + userData.id">
            <div class="w-full flex flex-col justify-center items-start">
              <div class="flex justify-center items-center">
                <img :src="userData.img" alt="" class="w-10 h-10 rounded-full" />

                <!-- <img :src="ad.img" alt="" class="w-10 h-10 rounded-full" /> -->
                <!-- <div class="text-xl px-4 py-1">{{ ad.user_name }}</div> -->

                <div class="text-xl px-4 py-1">{{ userData.name }}</div>
              </div>
              <div class="w-full flex justify-start items-center gap-2">
                <div class="text-lg font-semibold">Rating:</div>
                <div class="w-full flex justify-start items-center gap-2">
                  <div>4.5/5</div>
                  <Icon icon="material-symbols:star" width="24" height="24" />
                  <Icon icon="material-symbols:star" width="24" height="24" />
                  <Icon icon="material-symbols:star" width="24" height="24" />
                  <Icon icon="material-symbols:star" width="24" height="24" />
                  <Icon icon="material-symbols:star-half" width="24" height="24" />
                </div>
              </div>
            </div>
          </RouterLink>

          <div>{{ ad.created_at }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
