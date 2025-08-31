import { defineStore } from 'pinia'
import type { Tables } from '@/types/supabase'

type ChatRoom = Tables<'chat_rooms'>
export const useChatStore = defineStore('chat', {
  state: () => ({
    currentChat: {} as ChatRoom | null,
    onCurrentRoomOpen: false,
  }),
  actions: {
    setCurrentChat(chat: ChatRoom | null) {
      this.currentChat = chat
    },
  },
  persist: true, // or persist: { key: 'chat', storage: localStorage }
})
