<template>
  <div
    @click="handleClick"
    class="bg-green-500 flex gap-2 items-center rounded-md px-4 py-1.5 cursor-pointer z-50"
  >
    <Icon icon="mdi:plus" width="34" height="34" class="rounded-full text-white" />
    <button class="text-white font-semibold cursor-pointer">
      {{ props.title }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { Icon } from '@iconify/vue'

interface Title {
  title: string
}
const props = defineProps<Title>()

const emit = defineEmits(['clicked'])

function handleClick() {
  emit('clicked') // 👈 Emit the event
}
</script>

<style scoped></style>
