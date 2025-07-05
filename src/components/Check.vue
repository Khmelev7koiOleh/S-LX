<script setup>
import { ref, onMounted, toRefs, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useGetUserStore } from '@/stores/current-user-store'
import Button from './ui/button/Button.vue'
import { Icon } from '@iconify/vue'
import { useChatStore } from '@/stores/chat-store'

const chatStore = useChatStore()

const chat = chatStore.currentChat // Always available
console.log(chat, 'chat')

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const route = useRoute()
const othreUser = ref(null)
const id = route.params.id
const messages = ref([])
const message = ref('')
const errorMessage = ref('')
const certainRoom = ref(null)
const isMessagePanelOpen = ref(false)
const onMessagePanelOpen = ref('')

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
const toggleMessagePanel = (id) => {
  isMessagePanelOpen.value = !isMessagePanelOpen.value
  onMessagePanelOpen.value = id
}

const deleteMessage = async (id) => {
  console.log(id)

  const { error } = await supabase.from('messages').delete().eq('id', id)
  if (error) {
    console.log(error)
  }
}
// path: '/chats/' + chat.room_id,
//   state: { chat }

const getRoom = async () => {
  const { data, error } = await supabase.from('chat_rooms').select('*').eq('room_id', id)

  certainRoom.value = data
}

const otherUserId = computed(() => chat.participant_ids.find((id) => id !== user.value.id))

const getUser = async (id) => {
  const { data, error } = await supabase.from('user').select('*').eq('user_id', id).maybeSingle()

  othreUser.value = data
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
  console.log(chat, 'chat')
  subscribeToRoom(id, (newMessage) => {
    console.log('Neue Nachricht:', newMessage)
    getMessages(id)
  })
  getMessages()
  getRoom()
  getUser(otherUserId.value)
})
</script>

<template>
  <div class="w-[100vw] min-h-[calc(100vh-0px)] h-full p-0 bg-gray-300 relative">
    <div class="w-full flex justify-start items-center gap-4 p-1 bg-black text-white">
      <RouterLink :to="'/user-profile/' + otherUserId">
        <!-- some picum pic -->
        <div class="flex justify-start items-center gap-4 px-4 py-1">
          <div>
            <img
              :src="othreUser?.img"
              alt=""
              width="50"
              height="50"
              class="border border-black w-[50px] h-[50px] rounded-full"
            />
          </div>
          <div>
            <h1>{{ othreUser?.name }}</h1>
          </div>
        </div>
      </RouterLink>
      <!-- {{ finalParsed }} -->
      <!-- <div>{{ data.room_topic }}</div> -->

      <!-- <div class="p-4 bg-amber-300">{{ ad?.user_id }}</div> -->
    </div>
    <!-- {{ data }} -->
    <div class="w-full p-20">
      <div class="w-full p-4 relative" v-for="item in messages" :key="item">
        <div
          :class="
            item.sender_id === user.id ? 'w-full flex justify-end ' : 'w-full flex justify-start'
          "
          class="w-fit h-fit flex justify-end"
        >
          <div
            :class="
              item.sender_id === user.id
                ? 'text-right  bg-green-700 text-gray-300 px-6 py-1 rounded-lg w-fit flex flex-wrap justify-end  max-w-[60vw] relative'
                : 'text-left bg-gray-600 text-gray-300 px-6 py-1 rounded-lg w-fit flex justify-start  max-w-[60vw]'
            "
          >
            <div
              @click="toggleMessagePanel(item.id)"
              v-if="item.sender_id === user.id"
              class="text-xs text-gray-300 absolute top-4 right-1 translate-x-0 -translate-y-1/2"
            >
              <Icon icon="mdi:dots-vertical" width="20" height="20" class="" />
              <div
                v-if="isMessagePanelOpen && item.id === onMessagePanelOpen"
                class="flex flex-col justify-center items-center absolute bottom-full right-2 bg-gray-950 p-1 rounded-md mb-1 w-28 shadow-xl"
              >
                <div
                  @click="deleteMessage(item.id)"
                  class="w-full flex justify-center items-center text-white bg-gray-800 px-4 py-2 text-sm font-extralight"
                >
                  Delete
                </div>
                <div class="w-full flex justify-center items-center border-b border-gray-200"></div>
                <div
                  class="w-full flex px-4 py-2 justify-center items-center text-white bg-gray-800 text-sm font-extralight"
                >
                  Edit
                </div>
              </div>
            </div>
            {{ item.content }}
            <!-- <div class="text-xs text-gray-400">
          {{ item.created_at }}
        </div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="w-full flex gap-8 justify-center fixed bottom-0 left-0 bg-gray-50 p-2">
      <div class="text-red-500 text-sm" v-if="errorMessage.length > 0">{{ errorMessage }}"</div>
      <div class="w-full flex justify-center items-center gap-6 p-4">
        <div>
          <Icon icon="mdi:attachment" width="34" height="34" class="w-[34px] h-[34px] text-black" />
        </div>
        <div>
          <Icon icon="mdi:image" width="34" height="34" class="w-[34px] h-[34px] text-black" />
        </div>
        <input
          @keydown.enter="sendMessage(id, user.id, message)"
          type="text"
          placeholder="Message"
          v-model="message"
          class="w-1/3 shadow py-1 placeholder-black text-black rounded-md px-4"
        />

        <div class="w-[40px] h-[40px]">
          <div v-if="message.length > 0" class="flex justify-center items-center">
            <Button
              :disabled="message.length <= 0"
              @click="sendMessage(id, user.id, message)"
              class="w-[40px] h-[40px] flex items-center rounded-full"
              ><Icon icon="mdi:send" width="40" height="40" class="text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
