<script setup lang="ts">
import ChatsComponent from './ChatsComponent.vue'
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination'

// import { toRefs} from 'vue'
// import { useRouter } from 'vue-router'
// import { supabase } from '@/lib/supabaseClient'
// import { useGetUserStore } from '../stores/current-user-store'
// import ChatMessageComponent from '@/components/ChatMessageComponent.vue'
// import { Icon } from '@iconify/vue'
// import { useChatStore } from '../stores/chat-store'
// import { useGetUsersComposable } from '@/composables/get-users'
// import { useWindowSize } from '@/composables/useWindowSize'
// const { width, height, isPhone, isTablet, isLaptop } = useWindowSize()

// const { users, loading, error, getUsers } = useGetUsersComposable()

// const chatStore = useChatStore()

// const userStore = useGetUserStore()
// const { user } = toRefs(userStore)
// const messages = ref<any | null>(null)
// const router = useRouter()
// const chatsIn = ref<any | null>([])
// const getRoomsCurrentUserIn = async () => {
//   const { data, error } = await supabase
//     .from('chat_rooms')
//     .select('*')
//     .contains('participant_ids', [user.value.id])
//   if (error) {
//     console.error('Error fetching chat rooms:', error)
//     return
//   }
//   console.log(data)
//   chatsIn.value = data
//   return data
// }
// const goToChat = (chat: any) => {
//   console.log(chat)
//   chatStore.currentChat = chat // Store the chat
//   router.push(`/chats/${chat.room_id}`) // Navigate
// }
// // const getChatsValue = async (val: any) => {
// //   console.log(val)
// //   const { data, error } = await supabase.from('messages').select('*').eq('room_id', val)
// //   console.log(data)
// //   messages.value = data
// //   return data
// // }

// const ids = new Set<string>()
// onMounted(async () => {
//   await getRoomsCurrentUserIn()

//   chatsIn.value.forEach((chat: any) => {
//     chat.participant_ids.forEach((id: string) => {
//       if (id !== user.value.id) ids.add(id)
//     })
//   })
//   console.log([...ids])
//   await getUsers([...ids])
// })
// const itemsPerPage = 5

// const enrichedChats = computed(() => {
//   if (!chatsIn.value.length || !users.value.length || !user.value) return []

//   return chatsIn.value.map((chat: any) => {
//     const otherUserId = chat.participant_ids.find((id: string) => id !== user.value.id)
//     const otherUser = users.value.find((u) => u.id === otherUserId)

//     return {
//       ...chat,
//       name: otherUser?.name || 'Unknown',
//       img: otherUser?.img || null,
//     }
//   })
// })
// const getPaginatedChats = (page: number) => {
//   const start = (page - 1) * itemsPerPage

//   return enrichedChats.value.slice(start, start + itemsPerPage)
// }
</script>

<template>
  <div class="w-full flex flex-col mx-auto px-4">
    <div class="w-full flex flex-col gap-4 justify-center items-center p-4">
      <p class="text-sm font-light underline">Chats that you have</p>
    </div>
    <ChatsComponent />
  </div>
</template>

<style scoped></style>
