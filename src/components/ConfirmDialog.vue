<script setup lang="ts">
import { ref, toRefs } from 'vue'

import { Icon } from '@iconify/vue'

const props = defineProps<{
  message?: string
  confirmText?: string
  cancelText?: string
  item?: string
  icon?: string
  text_color?: string
}>()
const { message, confirmText, cancelText, item, icon } = toRefs(props)

// const emit = defineEmits(['confirm', 'cancel'])
const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
const isOpen = ref(false)
const isConfirming = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
  isConfirming.value = false
}

const askConfirmation = () => {
  isConfirming.value = true
}

const confirm = () => {
  emit('confirm')
  toggle()
}

const cancel = () => {
  emit('cancel')
  toggle()
}

// const deleteAd = async (id: string) => {
//   console.log(id)
//   // const { error } = await supabase.from('ads').delete().eq('id', id)
//   // if (error) console.log(error)
//   // else {
//   //   router.push({ name: 'about' })
//   // }
// }
</script>
<template>
  <div class="relative">
    <button
      class="w-[34px] h-[34px] flex justify-center items-center cursor-pointer m-2"
      @click="toggle"
    >
      <Icon :icon="icon || 'mdi:dots-vertical'" width="20" height="20" :class="text_color" />
    </button>

    <div
      v-if="isOpen"
      class="absolute top-full right-0 sm:w-[200px] md:w-fit bg-white shadow rounded-md py-2 z-10 transform transition-all duration-1000"
    >
      <div v-if="!isConfirming" class="text-center transition-all transform duration-1000">
        <button
          @click="askConfirmation"
          class="w-[200px] md:w-[200px] text-red-600 font-semibold transition-all transform duration-1000"
        >
          Delete this {{ item }}
        </button>
      </div>

      <div
        v-else
        :class="
          isConfirming
            ? 'w-[300px] transition-all transform duration-1000  flex flex-col items-center space-y-4  '
            : 'w-fit transition-all transform duration-1000  flex flex-col items-center space-y-4'
        "
      >
        <p class="text-sm text-black text-center">
          {{ message || 'Are you sure you want to perform this action?' }}
        </p>
        <div class="flex gap-4">
          <button @click="cancel" class="bg-gray-400 px-3 py-1 rounded">
            {{ cancelText || 'No' }}
          </button>
          <button @click="confirm" class="bg-red-500 text-white px-3 py-1 rounded">
            {{ confirmText || 'Yes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
