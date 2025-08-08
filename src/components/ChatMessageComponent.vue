<!-- src/views/AdDetail.vue -->
<script setup lang="ts">
import { onMounted, ref, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import type { AdsType } from '@/types/ads-type'
import Button from './ui/button/Button.vue'
import { useGetUserStore } from '@/stores/current-user-store'
import EmojiMessageComponent from './EmojiMessageComponent.vue'
import { useChatStore } from '@/stores/chat-store'
import { Icon } from '@iconify/vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
})

const { data: roomData, userData: userData } = toRefs(props)

const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const chatStore = useChatStore()
const message = ref('')
const router = useRouter()
const route = useRoute()
const ad = ref<AdsType | null>(null)
const showPicker = ref<boolean>(false)

const goToChat = (chat: any) => {
  console.log(chat)
  chatStore.currentChat = chat // Store the chat
  router.push(`/chats/${chat.room_id}`) // Navigate
}
async function sendMessage(room_id: string, sender_id: string, text: string) {
  console.log(room_id, sender_id, text)
  const { error } = await supabase.from('messages').insert([
    {
      room_id,
      sender_id,
      content: text,
    },
  ])
  showPicker.value = false
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
        event: '*',
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
  <div class="w-full h-full px-0 bg-gray-100 relative">
    <div
      @click="chatStore.onCurrentRoomOpen = !chatStore.onCurrentRoomOpen"
      class="absolute top-4 left-4"
    >
      <Icon icon="material-symbols:arrow-back" width="28" class="text-white cursor-pointer" />
    </div>
    <div @click="goToChat(roomData)" class="absolute top-4 right-4">
      <Icon icon="bx:expand" width="28" class="text-white cursor-pointer" />
    </div>
    <!-- <div class="text-red-500">{{ data.participant_ids[1] }}</div> -->
    <div class="w-full flex justify-center items-center gap-4 bg-gray-900 p-1">
      <!-- some picum pic -->
      <RouterLink :to="'/user-profile/' + data.participant_ids[1]">
        <div class="flex justify-start items-center gap-4 px-2 drop-shadow-[1px_4px_4px_white]">
          <div>
            <img
              :src="userData?.img"
              alt=""
              width="50"
              height="50"
              class="w-[50px] h-[50px] border border-black rounded-full"
            />
          </div>
          <!-- {{ finalParsed }} -->
          <div class="text-white">{{ userData.name }}</div>
        </div>
      </RouterLink>

      <!-- <div class="p-4 bg-amber-300">{{ ad?.user_id }}</div> -->
    </div>
    <!-- {{ data }} -->
    <div class="w-full h-[80%] flex flex-col gap-4 p-10 overflow-auto">
      <div v-for="item in data.msg" :key="item">
        {{ item.text }}
      </div>
      <div
        :class="
          item.sender_id === user.id ? 'w-full flex justify-end  ' : 'w-full flex justify-start'
        "
        class="w-fit h-fit flex justify-end items-center"
        v-for="item in theMessages"
        :key="item"
      >
        <div
          :class="
            item.sender_id === user.id
              ? 'text-right  bg-green-700 text-gray-300  rounded-lg w-fit flex flex-wrap justify-end  max-w-[60vw] relative px-4 '
              : 'text-left bg-gray-600 text-gray-300  rounded-lg w-fit flex justify-start  max-w-[60vw] px-4'
          "
        >
          {{ item.content }}
          <!-- <div class="text-xs text-gray-400">
          {{ item.created_at }}
        </div> -->
        </div>
      </div>
    </div>
    <div class="w-full absolute bottom-0 left-0 bg-white shadow">
      <div class="w-full flex justify-start items-center gap-2 p-1 px-2">
        <div class="">
          <EmojiMessageComponent
            v-model="message"
            :showPicker="showPicker"
            @update:showPicker="(val: boolean) => (showPicker = val)"
          />
        </div>

        <textarea
          @keydown.enter="sendMessage(data.room_id, user.id, message)"
          type="text"
          :rows="message.length > 30 ? 3 : 1"
          placeholder="Message"
          v-model="message"
          class="w-[70%] shadow py-1 resize-none placeholder-black text-black rounded-md px-4"
        ></textarea>

        <Button
          v-if="message.length > 0"
          :disabled="message.length <= 0"
          @click="sendMessage(data.room_id, user.id, message)"
          class="w-[40px] h-[40px] flex items-center text-white rounded-full p-3 absolute bottom-2 right-4"
          ><Icon icon="mdi:send" width="24" height="24"
        /></Button>
      </div>
    </div>
  </div>
</template>
