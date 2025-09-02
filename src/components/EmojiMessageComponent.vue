<script setup lang="ts">
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  modelValue: string
  showPicker?: boolean
}>()
interface Emoji {
  i: string
}

const emit = defineEmits(['update:modelValue', 'update:showPicker'])
const togglePicker = () => {
  emit('update:showPicker', !props.showPicker)
}

const onEmojiClick = (emoji: Emoji) => {
  const newMessage = props.modelValue + emoji.i
  emit('update:modelValue', newMessage)
}
</script>
<template>
  <div>
    <button @click="togglePicker()" class="px-2 py-1 rounded cursor-pointer">
      <Icon
        icon="proicons:emoji-laughter"
        width="30"
        height="30"
        class="w-[34px] h-[34px] text-black"
      />
    </button>

    <div v-if="props.showPicker" class="absolute bottom-full mb-2 left-0 z-50">
      <EmojiPicker @select="onEmojiClick" />
    </div>
  </div>
</template>

<style scoped></style>
