<template>
  <div class="flex items-center m-4">
    <button
      @click="handleClick"
      class="bg-green-500 rounded-md px-6 py-2.5 text-white font-semibold"
    >
      {{ props.title }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
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
