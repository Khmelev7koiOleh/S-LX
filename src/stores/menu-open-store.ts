import { defineStore } from 'pinia'

export const useMenuOpenStore = defineStore('menuOpen', {
  state: () => ({
    onMenuOpen: false,
  }),
  actions: {
    toggle() {
      this.onMenuOpen = !this.onMenuOpen
    },
  },
})
