import { defineStore } from 'pinia'

export const useClickFunctionStore = defineStore('clickFunction', {
  state: () => {
    return {
      isClicked: false,
    }
  },
  actions: {
    toggleClick() {
      this.isClicked = !this.isClicked
    },
  },
})
