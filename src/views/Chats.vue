<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '../stores/current-user-store'
import ChatMessageComponent from '@/components/ChatMessageComponent.vue'
import { Icon } from '@iconify/vue'

const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const messages = ref<any | null>(null)

const chatsIn = ref<any | null>(null)
const getRoomsCurrentUserIn = async () => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .contains('participant_ids', [user.value.id])
  if (error) {
    console.error('Error fetching chat rooms:', error)
    return
  }
  console.log(data)
  chatsIn.value = data
  return data
}

const getChatsValue = async (val: any) => {
  console.log(val)
  const { data, error } = await supabase.from('messages').select('*').eq('room_id', val)
  console.log(data)
  messages.value = data
  return data
}

onMounted(() => {
  getRoomsCurrentUserIn()
})
</script>

<template>
  <div class="text-2xl font-semibold w-full text-center">My all chats</div>
  <div class="w-full flex flex-col p-2" v-for="(chat, index) in chatsIn" :key="index">
    <RouterLink :to="'/chats/' + chat.room_id" class="w-1/3">
      <div @click="getChatsValue(chat.room_id)" class="overflow-hidden flex flex-col gap-4">
        <div
          class="flex items-center justify-start gap-2 bg-green-800 px-2 py-2 text-white font-mono rounded-md"
        >
          {{ index }}.
          <Icon icon="material-symbols:chat" width="24" />
          <div class="truncate max-w-full">{{ chat.room_topic }}</div>
        </div>
      </div>
    </RouterLink>

    <div v-if="messages">
      <!-- <ChatMessageComponent :data="chat" /> -->
    </div>
  </div>
</template>

<style scoped></style>
