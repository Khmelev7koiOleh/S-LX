<script setup lang="ts">
import { ref, toRefs, onMounted, watch, computed } from 'vue'

import { supabase } from '@/lib/supabaseClient'
import { useClickFunctionStore } from '@/stores/click-function-store'
import { useGetUserStore } from '@/stores/current-user-store'
import { adType } from '@/data/ad-type'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const clickStore = useClickFunctionStore()

const title = ref<string>('')
const description = ref<string>('')
const price = ref<string>('')
const discount = ref<string>('')
const if_discount = ref<boolean>(false)
const type = ref<string>('')
const files = ref<File[]>([])
// const file = ref<File | null>(null)
const imageUrl = ref<string>('')
const uploadError = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)
// Bild auswählen
const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    files.value = Array.from(target.files)
  }
}
const imageUrls = ref<string[]>([])
// Bild hochladen und Eintrag speichern

const handleUpload = async () => {
  if (!files.value.length) {
    console.error('Bitte wähle mindestens ein Bild aus.')
    return
  }

  imageUrls.value = []

  for (const file of files.value) {
    const filePath = `user-${Date.now()}-${file.name}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ads')
      .upload(filePath, file)

    if (uploadError) {
      console.error(`Fehler beim Hochladen von ${file.name}:`, uploadError.message)
      continue
    }

    const { data: publicData } = supabase.storage.from('ads').getPublicUrl(filePath)

    imageUrls.value.push(publicData.publicUrl)
  }
  const newAd: any = {
    title: title.value,
    description: description.value,
    price: price.value,
    type: type.value,
    img: imageUrls.value,
    user_id: user.value.id,
    ...(discount.value && { discount: discount.value }),
    ...(if_discount.value && { if_discount: if_discount.value }),
  }
  // Save all image URLs into the `img` field as an array
  const { error: insertError, data: insertData } = await supabase.from('ads').insert(newAd)
  if (insertError) {
    console.error('Fehler beim Speichern:', insertError.message)
  } else {
    // reset()
    clickStore.isClicked = !clickStore.isClicked
    console.log('Anzeige gespeichert:', insertData)
  }
}

// const filePath = `user-${Date.now()}+${file.value.name}.jpg`

// const { data: uploadData, error: uploadError } = await supabase.storage
//   .from('ads')
//   .upload(filePath, file.value)

// if (uploadError) {
//   console.error('Upload fehlgeschlagen:', uploadError.message)
//   return
// }

// const { data: publicData } = supabase.storage.from('ads').getPublicUrl(filePath)

// imageUrl.value = publicData.publicUrl

// // Nach erfolgreichem Upload: Daten speichern
// const { error: insertError, data: insertData } = await supabase.from('ads').insert({
//   title: title.value,
//   description: description.value,
//   price: price.value,
//   discount: discount.value,
//   if_discount: if_discount.value,
//   type: type.value,
//   img: imageUrl.value,
//   user_id: user.value.id,
// })

// if (insertError) {
//   console.error('Fehler beim Speichern:', insertError.message)
// } else {
//   clickStore.isClicked = !clickStore.isClicked
//   console.log('Anzeige gespeichert:', insertData)
// }
const disabledComputed = computed(() => {
  if (title.value && description.value && price.value && type.value && files.value.length) {
    return true
  } else {
    return false
  }
})
const reset = () => {
  title.value = ''
  description.value = ''
  price.value = ''
  discount.value = ''
  if_discount.value = false
  type.value = ''
  files.value = []
  imageUrl.value = ''
  uploadError.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
const closeAndReset = () => {
  clickStore.isClicked = !clickStore.isClicked
  reset()
}

const typeValue = (ref: string) => {
  type.value = ref
}
watch(if_discount, () => {
  if (if_discount.value === false) {
    discount.value = ''
  }
})
</script>

<template>
  <div
    class="p-8 space-y-2 flex flex-col max-w-[80%] mx-auto bg-gray-900 rounded-2xl h-full overflow-auto relative"
  >
    <button
      @click="closeAndReset()"
      class="absolute top-4 left-4 text-gray-200 placeholder:gray-200"
    >
      <Icon icon="material-symbols:arrow-back" width="24" height="24" />
    </button>
    <br />
    <input
      v-model="title"
      type="text"
      placeholder="Title"
      class="w-full p-2 border rounded text-gray-200 placeholder:gray-200"
    />

    <textarea
      v-model="description"
      :rows="description.length > 30 ? 3 : 1"
      type="text"
      placeholder="Description"
      class="w-full p-2 border rounded text-gray-200 placeholder:gray-200"
    >
    </textarea>

    <input
      v-model="price"
      type="text"
      placeholder="Price"
      class="w-full p-2 border rounded text-gray-200 placeholder:gray-200"
    />

    <div class="flex gap-2">
      <p class="text-gray-200 placeholder:gray-200">Add Discount</p>

      <input
        v-model="if_discount"
        type="checkbox"
        placeholder="If Discount"
        class="p-2 border rounded text-gray-200 placeholder:gray-200"
      />
    </div>

    <input
      v-if="if_discount"
      v-model="discount"
      type="text"
      placeholder="Discount price"
      class="w-full p-2 border rounded text-gray-200 placeholder:gray-200"
    />
    <select
      v-model="type"
      @change="typeValue(type)"
      placeholder="Type"
      class="w-full p-2 border rounded text-gray-200 placeholder:gray-200"
    >
      <option disabled value="">Select type</option>
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
    <input
      ref="fileInputRef"
      type="file"
      multiple
      @change="onFileChange"
      class="text-gray-200 placeholder:gray-200"
    />
    <div v-if="uploadError !== '' && !disabledComputed" class="text-center text-md text-red-400">
      {{ uploadError }}
    </div>
    <button
      type="submit"
      :disabled="!disabledComputed"
      @click="[handleUpload(), (uploadError = 'All fields are required')]"
      :class="
        disabledComputed
          ? 'bg-blue-500 px-4 py-2 rounded text-gray-200 placeholder:gray-200 cursor-pointer'
          : 'bg-gray-500 px-4 py-2 rounded text-gray-200 placeholder:gray-200'
      "
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
