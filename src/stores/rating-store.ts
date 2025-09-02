import { defineStore } from 'pinia'

export const useRatingsStore = defineStore('ratings', {
  state: () => ({
    rating: 0,
    id: '' as string | null,
  }),

  actions: {},

  persist: true,
})
