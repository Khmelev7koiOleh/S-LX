<script setup lang="ts">
import { ref } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { Icon } from '@iconify/vue'

// Props
const props = defineProps<{
  modelValue: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
const showPicker = ref(false)
const onEmojiClick = (emoji: any) => {
  const newMessage = props.modelValue + emoji.i
  emit('update:modelValue', newMessage)
  showPicker.value = false
}
</script>
<template>
  <div>
    <button @click="showPicker = !showPicker" class="px-2 py-1 rounded cursor-pointer">
      <Icon
        icon="proicons:emoji-laughter"
        width="30"
        height="30"
        class="w-[34px] h-[34px] text-black"
      />
    </button>

    <div v-if="showPicker" class="absolute bottom-full mb-2 left-0 z-50">
      <EmojiPicker @select="onEmojiClick" />
    </div>
  </div>
</template>

<style scoped></style>
