<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { uploadImage } from '@/composables/upload'

const file = ref<File | null>(null)
const imageUrl = ref<string>('')

const handleUpload = async () => {
  if (!file.value) return

  const filePath = `user-${Date.now()}.jpg`
  const uploaded = await uploadImage(file.value, filePath)

  if (uploaded) {
    const { data } = supabase.storage.from('ads').getPublicUrl(filePath)
    imageUrl.value = data.publicUrl
  }
}
</script>

<template>
  <div class="p-4 bg-gray-700 flex flex-col gap-4 items-center justify-center">
    <input
      type="file"
      accept="image/*"
      class="text-white bg-amber-500 px-2 py-1 rounded-xl"
      @change="(e) => (file = (e.target as HTMLInputElement).files?.[0] || null)"
    />

    <button @click="handleUpload" class="text-white bg-gray-900 rounded-md px-2 py-1">
      Upload
    </button>
    <div v-if="imageUrl">
      <p>Image URL:</p>
      <img :src="imageUrl" class="w-40" />
    </div>
  </div>
</template>
