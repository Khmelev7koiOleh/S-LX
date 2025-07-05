<script setup lang="ts">
import { ref, toRefs, onMounted, watchEffect } from 'vue'

import { supabase } from '@/lib/supabaseClient'
import { useClickFunctionStore } from '@/stores/click-function-store'
import { useGetUserStore } from '@/stores/current-user-store'
import { adType } from '@/data/ad-type'

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const clickStore = useClickFunctionStore()

const title = ref<string>('')
const description = ref<string>('')
const price = ref<string>('')
const discount = ref<string>('')
const if_discount = ref<boolean>(false)
const type = ref<string>('')

const file = ref<File | null>(null)
const imageUrl = ref<string>('')

// Bild auswählen
const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
  }
}

// Bild hochladen und Eintrag speichern
const handleUpload = async () => {
  if (!file.value) {
    console.error('Bitte wähle ein Bild aus.')
    return
  }

  const filePath = `user-${Date.now()}+${file.value.name}.jpg`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ads')
    .upload(filePath, file.value)

  if (uploadError) {
    console.error('Upload fehlgeschlagen:', uploadError.message)
    return
  }

  const { data: publicData } = supabase.storage.from('ads').getPublicUrl(filePath)

  imageUrl.value = publicData.publicUrl

  // Nach erfolgreichem Upload: Daten speichern
  const { error: insertError, data: insertData } = await supabase.from('ads').insert({
    title: title.value,
    description: description.value,
    price: price.value,
    discount: discount.value,
    if_discount: if_discount.value,
    type: type.value,
    img: imageUrl.value,
    user_id: user.value.id,
    user_email: user.value.email,
    user_name: user.value.name,
  })

  if (insertError) {
    console.error('Fehler beim Speichern:', insertError.message)
  } else {
    clickStore.isClicked = !clickStore.isClicked
    console.log('Anzeige gespeichert:', insertData)
  }
}

const typeValue = (ref: string) => {
  console.log(ref)
  type.value = ref
}

// watchEffect(() => {
//   console.log(type.value)
// })
</script>

<template>
  <div
    class="p-8 space-y-2 flex flex-col max-w-[80%] mx-auto bg-gray-900 rounded-2xl h-full overflow-auto"
  >
    <input
      v-model="title"
      type="text"
      placeholder="Title"
      class="w-full p-2 border rounded text-gray-200 placeholder:gray-200"
    />

    <input
      v-model="description"
      type="text"
      placeholder="Description"
      class="w-full p-2 border rounded text-gray-200 placeholder:gray-200"
    />

    <input
      v-model="price"
      type="text"
      placeholder="Price"
      class="w-full p-2 border rounded text-gray-200 placeholder:gray-200"
    />

    <div class="flex gap-2">
      <p class="text-gray-200 placeholder:gray-200">If Discount</p>

      <input
        v-model="if_discount"
        type="checkbox"
        placeholder="If Discount"
        class="p-2 border rounded text-gray-200 placeholder:gray-200"
      />
    </div>

    <input
      v-model="discount"
      type="text"
      placeholder="Discount"
      class="w-full p-2 border rounded text-gray-200 placeholder:gray-200"
    />
    <select
      v-model="type"
      @change="typeValue(type)"
      placeholder="Type"
      class="w-full p-2 border rounded text-gray-200 placeholder:gray-200"
    >
      <option v-for="tp in adType" :key="tp.value" :value="tp.value">
        {{ tp.title }}
      </option>
    </select>
    <div v-if="imageUrl" class="mt-4">
      <p class="text-sm text-gray-600">Bildvorschau:</p>
      <img
        :src="imageUrl"
        alt="Preview"
        class="w-48 h-auto mt-2 rounded text-gray-200 placeholder:gray-200"
      />
    </div>
    <input type="file" @change="onFileChange" class="text-gray-200 placeholder:gray-200" />

    <button
      @click="handleUpload"
      class="bg-blue-500 px-4 py-2 rounded text-gray-200 placeholder:gray-200"
    >
      Upload & Save
    </button>
  </div>
</template>

<style scoped>
input[type='file'] {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
}
</style>
