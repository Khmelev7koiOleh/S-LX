<!-- src/views/AdDetail.vue -->
<script setup lang="ts">
import { onMounted, ref, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import type { AdsType } from '@/types/ads-type'
import Button from './ui/button/Button.vue'
import { useGetUserStore } from '@/stores/current-user-store'

import { useChatStore } from '@/stores/chat-store'
import { Icon } from '@iconify/vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const { data: roomData } = toRefs(props)

const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const chatStore = useChatStore()
const message = ref('')

const route = useRoute()
const ad = ref<AdsType | null>(null)

async function sendMessage(room_id: string, sender_id: string, text: string) {
  console.log(room_id, sender_id, text)
  const { error } = await supabase.from('messages').insert([
    {
      room_id,
      sender_id,
      content: text,
    },
  ])

  if (error) console.error('Nachricht konnte nicht gesendet werden:', error)
}
const theMessages = ref<any[] | null>(null)
async function getMessages(room_id: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', room_id)
    .order('created_at', { ascending: true })
  message.value = ''
  theMessages.value = data
  return data
}
function subscribeToRoom(room_id: string, callback: (newMessage: any) => void) {
  return supabase
    .channel(`room:${room_id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${room_id}`,
      },
      (payload) => callback(payload.new),
    )
    .subscribe()
}
onMounted(async () => {
  // transformCheckValue()
  // await getChat()
  const { data, error } = await supabase.from('ads').select('*').eq('id', route.params.id).single()

  if (!error) {
    ad.value = data
  }
  await getMessages(roomData.value.room_id)
  subscribeToRoom(roomData.value.room_id, (newMessage) => {
    console.log('Neue Nachricht:', newMessage)
    getMessages(roomData.value.room_id)
  })
})
</script>

<template>
  <div class="w-full h-full px-0 bg-gray-300 relative">
    <div
      @click="chatStore.onCurrentRoomOpen = !chatStore.onCurrentRoomOpen"
      class="absolute top-4 left-4"
    >
      <Icon icon="material-symbols:close" width="28" class="text-black cursor-pointer" />
    </div>
    <!-- <div class="text-red-500">{{ data.participant_ids[1] }}</div> -->
    <div class="w-full flex justify-center items-center gap-4 bg-gray-400 p-1">
      <!-- some picum pic -->
      <RouterLink :to="'/user-profile/' + data.participant_ids[1]">
        <div class="flex justify-start items-center gap-4 p-1">
          <div>
            <img
              src="/public/logo.png"
              alt=""
              width="50"
              height="50"
              class="border border-black rounded-full"
            />
          </div>
          <!-- {{ finalParsed }} -->
          <div>{{ data.room_topic }}</div>
        </div>
      </RouterLink>

      <!-- <div class="p-4 bg-amber-300">{{ ad?.user_id }}</div> -->
    </div>
    <!-- {{ data }} -->
    <div class="w-full p-20">
      <div v-for="item in data.msg" :key="item">
        {{ item.text }}
      </div>
      <div class="w-full p-6" v-for="item in theMessages" :key="item">
        <div
          :class="
            item.sender_id === user.id
              ? 'text-right  bg-green-500 p-2 rounded-lg'
              : 'text-left bg-gray-400 p-2 rounded-lg'
          "
        >
          {{ item.content }}
          <!-- <div class="text-xs text-gray-400">
          {{ item.created_at }}
        </div> -->
        </div>
      </div>
    </div>
    <div class="w-full absolute bottom-0 left-0">
      <div class="w-full flex justify-center items-center p-1 bg-gray-500">
        <input type="text" placeholder="Message" v-model="message" class="border border-red-300" />
      </div>

      <div class="w-full flex justify-end items-center p-1 bg-gray-500">
        <Button
          @click="sendMessage(data.room_id, user.id, message)"
          class="w-full flex items-center p-2 gap-1 text-white rounded-lg"
          >Send</Button
        >
      </div>
    </div>
  </div>
</template>
