import { defineStore } from 'pinia'

export const useFilterStore = defineStore('clickFunction', {
  state: () => {
    return {
      selectedCategory: '',
    }
  },
  actions: {
    setSelectedCategory(category: string) {
      this.selectedCategory = category
    },
  },
})
