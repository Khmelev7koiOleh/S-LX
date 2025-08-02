<script setup lang="ts">
import { defineProps } from 'vue'
import { Icon } from '@iconify/vue'
import { useWindowSize } from '@/composables/useWindowSize'

const { width, height, isPhone, isTablet, isLaptop } = useWindowSize()

interface Title {
  title: string
}
const props = defineProps<Title>()

const emit = defineEmits(['clicked'])

function handleClick() {
  emit('clicked') // 👈 Emit the event
}
</script>

<template>
  <div
    @click="handleClick"
    :class="
      isPhone
        ? 'w-full bg-green-500 flex gap-2 justify-center items-center rounded-md px-4 py-1.5 cursor-pointer'
        : ' bg-green-500 flex gap-2 justify-center items-center rounded-md px-4 py-1.5 cursor-pointer'
    "
  >
    <Icon icon="mdi:plus" width="34" height="34" class="rounded-full text-white" />
    <button class="text-white font-semibold cursor-pointer">
      {{ props.title }}
    </button>
  </div>
</template>

<style scoped></style>
