<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useGetUserStore } from '../stores/current-user-store'
import { useChatStore } from '../stores/chat-store'
import { useRouter } from 'vue-router'

import { Icon } from '@iconify/vue'

const chatStore = useChatStore()

const chat = chatStore.currentChat // Always available
console.log(chat, 'chat')
const router = useRouter()
const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const props = defineProps<{
  message?: string
  confirmText?: string
  cancelText?: string
  item?: string
  icon?: string
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
      <Icon :icon="icon || 'mdi:dots-vertical'" width="20" height="20" class="text-white" />
    </button>

    <div
      v-if="isOpen"
      class="absolute top-full right-8 w-fit bg-white shadow rounded-md px-4 py-2 z-50"
    >
      <div v-if="!isConfirming" class="text-center transition-all transform duration-1000">
        <button
          @click="askConfirmation"
          class="text-red-600 font-semibold w-full transition-all transform duration-1000"
        >
          Delete this {{ item }}
        </button>
      </div>

      <div
        v-else
        :class="
          isConfirming
            ? 'w-[300px] transition-all transform duration-1000  flex flex-col items-center space-y-4'
            : 'w-[100px] transition-all transform duration-1000  flex flex-col items-center space-y-4'
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
