<!-- src/views/AdDetail.vue -->
<script setup lang="ts">
import { onMounted, ref, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import type { AdsType } from '@/types/ads-type'
import Button from './ui/button/Button.vue'
import { useGetUserStore } from '@/stores/current-user-store'
import ChatMessageComponent from './ChatMessageComponent.vue'

const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const message = ref('')
// const room = ref('general')
const route = useRoute()
const ad = ref<AdsType | null>(null)
const chat = ref<any | null>(null)
const theMessage = ref<{ msg: string }[]>([])
const currentRoom = ref<any[] | null>(null)
const onCurrentRoomOpen = ref<boolean>(false)
const klasse = ref<any[] | null>([])
const klasseNew = ref<any[] | null>([])

// async function sendMessage(user: AdsType, message: string, room = 'general') {
//   const { data, error } = await supabase.from('chat').insert([
//     {
//       user_id: user.id,
//       user_name: user.user_name,
//       content: message,
//       room_id: room,
//       usere_1: user.id,
//       usere_2: user.user_id,
//     },
//   ])
//   console.log('data', data)
//   if (error) console.error('Error sending message:', error)
// }

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

onMounted(async () => {
  await getChat()
  const { data, error } = await supabase.from('ads').select('*').eq('id', route.params.id).single()

  if (!error) {
    ad.value = data
  }
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
    <div
      v-if="currentRoom && onCurrentRoomOpen"
      class="w-1/3 h-full absolute right-0 flex flex-col justify-center items-center bg-amber-200"
    >
      <div class="w-1/3 h-full fixed bottom-0 right-0 flex flex-col justify-center items-center">
        <ChatMessageComponent :data="currentRoom" />
      </div>
    </div>
    <!-- <div>check if the chat exists , if no create it if yes updade it</div> -->

    <!-- <div class="bg-red-400">{{ getOrCreateConversation }}</div> -->

    <div class="flex flex-row justify-center items-center gap-8" v-if="ad">
      <div class="flex flex-col justify-center items-center gap-4">
        <div class="w-[500px] h-[350px] overflow-hidden">
          <img :src="ad.img" alt="" class="w-full h-full object-cover rounded-lg" />
        </div>

        <div v-for="sm in theMessage" :key="sm">{{ sm }}</div>
        <div class="flex gap-3">
          <!-- {{ theMessage }} -->
          <div class="font-bold">Description:</div>
          <p>{{ ad.description }}</p>
        </div>
      </div>

      <div class="flex flex-col justify-center items-center gap-2 bg-gray-200 p-10">
        <h1>{{ ad.title }}</h1>
        <p>{{ ad.price }} €</p>
        <Button
          @click="
            (() => {
              createChatRoom(user.id, ad.user_id)
              onCurrentRoomOpen = !onCurrentRoomOpen
            })()
          "
          class="w-full flex items-center p-2 gap-1 text-white rounded-lg cursor-pointer"
          >Message</Button
        >

        <!-- <Button
        @click="startChat(user.id, ad.user_id)"
        class="w-full flex items-center p-2 gap-1 text-white rounded-lg"
        >Message</Button
      > -->
        <Button class="w-full flex items-center p-2 gap-1 text-white rounded-lg"
          >Phone number</Button
        >
      </div>
    </div>

    <!-- <RouterLink :to="`/message/${}`" >
    <ChatMessageComponent />
  </RouterLink> -->
  </div>
</template>
