<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const props = defineProps<{
  modelValue: boolean
  userId: string
}>()

const emit = defineEmits(['update:modelValue', 'updated'])

const description = ref('')
const location = ref('')
const tel = ref('')

const reset = () => {
  description.value = ''
  location.value = ''
  tel.value = ''
}

const handleCancel = () => {
  reset()
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  const { data, error } = await supabase
    .from('user')
    .update({
      description: description.value,
      location: location.value,
      tel: tel.value,
    })
    .eq('user_id', props.userId)

  if (!error) {
    emit('updated')
    reset()
    emit('update:modelValue', false)
  } else {
    console.error(error)
  }
}
</script>

<template>
  <div v-if="modelValue" class="flex flex-col gap-4 w-full md:w-1/2">
    <div class="px-4 py-2 shadow rounded bg-white">
      <input
        v-model="description"
        type="text"
        placeholder="Add my description"
        class="w-full focus:outline-none"
      />
    </div>

    <div class="flex gap-4 justify-end">
      <button
        @click="handleSubmit"
        class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        Save
      </button>
      <button @click="handleCancel" class="bg-gray-300 px-4 py-2 rounded shadow hover:bg-gray-400">
        Cancel
      </button>
    </div>
  </div>
</template>

<style scoped></style>
