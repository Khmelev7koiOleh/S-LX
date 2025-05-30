<!-- src/views/AdDetail.vue -->
<script setup lang="ts">
import { onMounted, ref, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import type { AdsType } from '@/types/ads-type'
import Button from './ui/button/Button.vue'
import { useGetUserStore } from '@/stores/current-user-store'
import { text } from 'stream/consumers'

const userStore = useGetUserStore()
const { user } = toRefs(userStore)
// const message = ref('lol check')
// const room = ref('general')
const route = useRoute()
const ad = ref<AdsType | null>(null)
const chat = ref<any | null>(null)
const theMessage = ref('')

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
  // Prüfen, ob bereits ein Chat existiert (in beliebiger Reihenfolge)
  const { data: existingConvo, error } = await supabase
    .from('chat')
    .select('*')
    .or(
      `and(user1_id.eq.${user_1},user2_id.eq.${user_2}),and(user1_id.eq.${user_2},user2_id.eq.${user_1})`,
    )
    .single()

  if (existingConvo) return existingConvo

  // Falls nicht, neuen Chat erstellen
  const { data: newConvo, error: createError } = await supabase
    .from('chat')
    .insert([
      {
        user_name: 'just a name',
        room_id: user_1 + '_' + user_2,
        content: 'text and smth else',
        participants: [{ participant_1: user_1 }, { participant_2: user_2 }], // [user_1, user_2],
        check: [{ messages: 'text and smth else' }],
      },
    ])
    .select()
    .single()

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
  <div>check if the chat exists , if no create it if yes updade it</div>
  <div class="flex flex-row justify-center items-center gap-8" v-if="ad">
    <div class="flex flex-col justify-center items-center gap-4">
      <div class="w-[500px] h-[350px] overflow-hidden">
        <img :src="ad.img" alt="" class="w-full h-full object-cover rounded-lg" />
      </div>

      <div class="flex gap-3">
        <div class="font-bold">Description:</div>
        <p>{{ ad.description }}</p>
      </div>
    </div>

    <div class="flex flex-col justify-center items-center gap-2 bg-gray-200 p-10">
      <h1>{{ ad.title }}</h1>
      <p>{{ ad.price }} €</p>
      <!-- <Button
        @click="sendMessage(ad, 'the check ', 'general')"
        class="w-full flex items-center p-2 gap-1 text-white rounded-lg"
        >Message</Button
      > -->

      <Button
        @click="startChat(user.id, ad.user_id)"
        class="w-full flex items-center p-2 gap-1 text-white rounded-lg"
        >Message</Button
      >
      <Button class="w-full flex items-center p-2 gap-1 text-white rounded-lg">Phone number</Button>
    </div>
  </div>
  <div v-for="message in chat" :key="message.room_id">
    <div class="bg-fuchsia-900 text-white px-2 py-1 my-1">*{{ message.room_id }}</div>
  </div>

  <div class="p-20">
    <input
      type="text"
      placeholder="Message"
      v-model="theMessage"
      class="border border-red-300"
      @keydown.enter="sendMessageToMessage(ad.id, theMessage)"
    />
  </div>
</template>
