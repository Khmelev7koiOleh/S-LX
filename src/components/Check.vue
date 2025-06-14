<script setup>
import { ref, onMounted, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useGetUserStore } from '@/stores/current-user-store'
import Button from './ui/button/Button.vue'

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const route = useRoute()
const id = route.params.id
const messages = ref([])
const message = ref('')
const errorMessage = ref('')

const getMessages = async () => {
  const { data, error } = await supabase.from('messages').select('*').eq('room_id', id)

  console.log(data)
  if (!error) {
    messages.value = data
  }
}

const sendMessage = async (room_id, sender_id, text) => {
  console.log(room_id, sender_id, text)
  if (text.length <= 0) {
    errorMessage.value = 'Message field must contain at least one character'
    return
  }
  const { error } = await supabase.from('messages').insert([
    {
      room_id: room_id,
      sender_id: sender_id,
      content: text,
    },
  ])
  if (error) {
    console.log(error)
  } else {
    message.value = ''
    errorMessage.value = ''
  }
}

function subscribeToRoom(room_id, callback) {
  return supabase
    .channel(`room:${room_id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${room_id}`,
      },
      (payload) => callback(payload.new),
    )
    .subscribe()
}
onMounted(() => {
  subscribeToRoom(id, (newMessage) => {
    console.log('Neue Nachricht:', newMessage)
    getMessages(id)
  })
  getMessages()
})
</script>

<template>
  <div class="w-[100vw] min-h-[calc(100vh-0px)] h-full p-0 bg-gray-300 relative">
    <div class="w-full flex justify-start items-center gap-4 p-1 bg-black text-white">
      <!-- some picum pic -->
      <div>
        <img
          src="/public/logo.png"
          alt=""
          width="50"
          height="50"
          class="border border-black rounded-full"
        />
      </div>
      <div>
        <h1>Ad ID: {{ id }}</h1>
      </div>

      <!-- {{ finalParsed }} -->
      <!-- <div>{{ data.room_topic }}</div> -->

      <!-- <div class="p-4 bg-amber-300">{{ ad?.user_id }}</div> -->
    </div>
    <!-- {{ data }} -->
    <div class="w-full p-20">
      <div class="w-full p-4" v-for="item in messages" :key="item">
        <div
          :class="
            item.sender_id === user.id ? 'w-full flex justify-end ' : 'w-full flex justify-start'
          "
          class="w-full flex justify-end overflow-auto"
        >
          <div
            :class="
              item.sender_id === user.id
                ? 'text-right  bg-green-500 p-2 rounded-lg w-full flex flex-wrap justify-end  max-w-[60vw]'
                : 'text-left bg-blue-300 p-2 rounded-lg w-full flex justify-start  max-w-[60vw]'
            "
          >
            {{ item.content }}
            <!-- <div class="text-xs text-gray-400">
          {{ item.created_at }}
        </div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="w-full flex gap-8 justify-center fixed bottom-0 left-0 bg-gray-800 p-2">
      <div class="text-red-500 text-sm" v-if="errorMessage.length > 0">{{ errorMessage }}"</div>
      <div class="flex justify-center items-center p-4">
        <input
          @keydown.enter="sendMessage(id, user.id, message)"
          type="text"
          placeholder="Message"
          v-model="message"
          class="border border-red-300 placeholder-white text-white"
        />
      </div>

      <div class="flex justify-center items-center">
        <Button
          :disabled="message.length <= 0"
          @click="sendMessage(id, user.id, message)"
          class="flex items-center px-4 py-1 gap-1 text-white rounded-lg"
          >Send the message</Button
        >
      </div>
    </div>
  </div>
</template>

<style scoped></style>
