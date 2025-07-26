<script setup lang="ts">
import ChatsComponent from './ChatsComponent.vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { ref, toRefs, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '../stores/current-user-store'
import ChatMessageComponent from '@/components/ChatMessageComponent.vue'
import { Icon } from '@iconify/vue'
import { useChatStore } from '../stores/chat-store'
import { useGetUserComposable } from '@/composables/get-user'

const { users, loading, error, getUser } = useGetUserComposable()

const chatStore = useChatStore()

const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const messages = ref<any | null>(null)
const router = useRouter()
const chatsIn = ref<any | null>([])
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
const goToChat = (chat: any) => {
  console.log(chat)
  chatStore.currentChat = chat // Store the chat
  router.push(`/chats/${chat.room_id}`) // Navigate
}
// const getChatsValue = async (val: any) => {
//   console.log(val)
//   const { data, error } = await supabase.from('messages').select('*').eq('room_id', val)
//   console.log(data)
//   messages.value = data
//   return data
// }

const ids = new Set<string>()
onMounted(async () => {
  await getRoomsCurrentUserIn()

  chatsIn.value.forEach((chat: any) => {
    chat.participant_ids.forEach((id: string) => {
      if (id !== user.value.id) ids.add(id)
    })
  })
  console.log([...ids])
  await getUser([...ids])
})
const itemsPerPage = 5

const enrichedChats = computed(() => {
  if (!chatsIn.value.length || !users.value.length || !user.value) return []

  return chatsIn.value.map((chat: any) => {
    const otherUserId = chat.participant_ids.find((id: string) => id !== user.value.id)
    const otherUser = users.value.find((u) => u.id === otherUserId)

    return {
      ...chat,
      name: otherUser?.name || 'Unknown',
      img: otherUser?.img || null,
    }
  })
})
const getPaginatedChats = (page: number) => {
  const start = (page - 1) * itemsPerPage

  return enrichedChats.value.slice(start, start + itemsPerPage)
}
</script>

<template>
  <div class="w-full flex flex-col mx-auto px-4">
    <!-- <div>{{ enrichedChats }}</div> -->
  </div>

  <div class="p-10">
    <Pagination
      class="w-full flex flex-col justify-center items-center gap-10"
      v-slot="{ page }"
      :items-per-page="itemsPerPage"
      :total="chatsIn.length"
      :default-page="1"
    >
      <div class="mt-4 space-y-2 w-[60vw]">
        <div
          v-for="chat in getPaginatedChats(page)"
          :key="chat.id"
          class="bg-black border p-2 rounded-md"
        >
          <!-- <div class="text-white">{{ chat }}</div> -->
          <div @click="goToChat(chat)">
            <div class="w-full text-white flex justify-between items-center gap-4 px-4">
              <div class="w-[33%] flex justify-start items-center gap-4">
                <Icon icon="material-symbols:chat" width="24" />
                <div>
                  <img
                    :src="chat.img"
                    alt=""
                    width="34"
                    height="34"
                    class="w-[34px] h-[34px] object-cover rounded-full"
                  />
                </div>

                <div class="truncate">{{ chat.name }}</div>
              </div>
              <div class="w-[33%] flex justify-center items-center">
                <p>|</p>
              </div>
              <div class="w-[33%] flex justify-start items-center gap-4">
                <div class="w-full flex justify-start items-center gap-4">
                  <p>Topic:</p>
                  <div class="truncate">{{ chat.room_topic }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PaginationContent class="fixed bottom-8" v-slot="{ items }">
        <PaginationPrevious />

        <template v-for="(item, index) in items" :key="index">
          <PaginationItem
            v-if="item.type === 'page'"
            :value="item.value"
            :is-active="item.value === page"
          >
            {{ item.value }}
          </PaginationItem>
        </template>

        <PaginationEllipsis :index="4" />
        <PaginationNext />
      </PaginationContent>
    </Pagination>
  </div>
</template>

<style scoped></style>
