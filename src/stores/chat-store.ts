import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    currentChat: null,
    onCurrentRoomOpen: false,
  }),
  actions: {
    setCurrentChat(chat: any) {
      this.currentChat = chat
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'chat',
        storage: localStorage,
      },
    ],
  },
})
