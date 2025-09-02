<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const input = ref(props.modelValue)

// Sync prop with internal ref
watch(
  () => props.modelValue,
  (val) => {
    input.value = val
  },
)

watch(input, (val) => {
  emit('update:modelValue', val)
})
</script>

<template>
  <div class="w-[100%] flex items-center bg-white">
    <div class="w-[100%] relative">
      <Icon
        icon="mdi:magnify"
        width="30"
        height="30"
        class="absolute top-1/2 left-3 -translate-y-1/2"
      />
      <input
        v-model="input"
        type="text"
        placeholder="What are you looking for?"
        class="w-full pr-3 py-2 pl-10 border border-gray-400 rounded-lg rounded-r-none focus:outline-none"
      />
    </div>
    <div class="bg-blue-950 rounded-r-md p-2.5 text-white border border-blue-950">Search</div>
  </div>
</template>

<style scoped></style>
