<script setup lang="ts">
import { ref, toRefs, watch, computed } from 'vue'

import { supabase } from '@/lib/supabaseClient'
import { useClickFunctionStore } from '@/stores/click-function-store'
import { useGetUserStore } from '@/stores/current-user-store'
import { adType } from '@/data/ad-type'
import { Icon } from '@iconify/vue'

import 'vue-sonner/style.css' // needed for styling
import { toast } from 'vue-sonner'
import { useWindowSize } from '@/composables/useWindowSize'
const { isPhone } = useWindowSize()

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
const errorMessage = ref<string>('')

const imageUrl = ref<string>('')
const uploadError = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    files.value = Array.from(target.files)
  }
}
const imageUrls = ref<string[]>([])
const isUploading = ref(false) // track upload state

const handleUpload = async () => {
  if (isUploading.value) {
    console.log('Upload already in progress')
    return
  }

  if (!files.value.length) {
    console.error('Bitte wähle mindestens ein Bild aus.')
    return
  }

  isUploading.value = true
  imageUrls.value = []

  try {
    for (const file of files.value) {
      const filePath = `user-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('ads').upload(filePath, file)

      if (uploadError) {
        console.error(`Fehler beim Hochladen von ${file.name}:`, uploadError.message)
        continue
      }

      const { data: publicData } = supabase.storage.from('ads').getPublicUrl(filePath)
      imageUrls.value.push(publicData.publicUrl)
    }
    interface NewAd {
      title: string
      description: string
      price: string
      type: string
      img: string[]
      user_id: string
      discount: string | null
      if_discount: boolean
    }
    const newAd: NewAd = {
      title: title.value,
      description: description.value,
      price: price.value,
      type: type.value,
      img: imageUrls.value,
      user_id: user.value.id,
      discount: discount.value || null,
      if_discount: if_discount.value ?? false,
    }

    const { error: insertError, data: insertData } = await supabase.from('ads').insert(newAd)

    if (insertError) {
      let friendlyMessage = 'Something went wrong. Please try again.'
      if (insertError.message.includes('invalid input syntax for type numeric')) {
        friendlyMessage = 'Please enter a valid number.'
      } else if (insertError.message.includes('duplicate key')) {
        friendlyMessage = 'This item already exists.'
      } else if (insertError.message.includes('null value')) {
        friendlyMessage = 'Required fields cannot be empty.'
      }

      console.error('Insert error:', insertError.message)
      errorMessage.value = friendlyMessage
    } else {
      clickStore.isClicked = !clickStore.isClicked
      console.log('insertData:', insertData)
    }
  } finally {
    isUploading.value = false // reset state no matter what
    toast.success('Ad has been uploaded')
  }
}

const disabledComputed = computed(() => {
  if (
    title.value &&
    description.value &&
    price.value &&
    type.value &&
    files.value.length &&
    (if_discount.value === false || (if_discount.value === true && discount.value !== ''))
  ) {
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
    class="flex flex-col justify-center items-start gap-1 max-w-[100vw] mx-auto bg-white overflow-auto relative"
    :class="isPhone ? 'w-[100vw] h-[calc(100vh-70px)]' : 'w-full h-[calc(100vh-0px)]'"
  >
    <button
      @click="closeAndReset()"
      class="absolute top-8 left-6 text-gray-900 placeholder:gray-200 flex items-center gap-6"
    >
      <Icon icon="material-symbols:arrow-back" width="24" height="24" />
      <p class="text-gray-600 text-lg font-semibold">Post your ad</p>
    </button>
    <br />

    <div
      class="p-8 md:p-4 space-y-4 flex flex-col justify-center items-start gap-1 max-w-[100vw] mx-auto overflow-auto relative rounded-md"
      :class="isPhone ? 'w-[90vw]  shadow' : 'w-[95%] bg-[#f79812]'"
    >
      <div class="w-full flex flex-col justify-start items-start gap-2">
        <p class="text-gray-900 text-sm font-semibold">Title</p>
        <input
          v-model="title"
          type="text"
          placeholder="Add Title"
          class="w-full p-2 border rounded text-gray-900 placeholder:text-gray-900 placeholder:text-sm border-gray-900"
        />
      </div>

      <div class="w-full flex flex-col justify-start items-start gap-2">
        <p class="text-gray-900 text-sm font-semibold">Description</p>
        <textarea
          v-model="description"
          :rows="description.length > 40 ? 4 : 1"
          type="text"
          placeholder="Description"
          class="w-full p-2 border rounded text-gray-900 placeholder:text-gray-900 placeholder:text-sm border-gray-900"
        >
        </textarea>
      </div>

      <div class="w-full flex flex-col justify-start items-start gap-2">
        <p class="text-gray-900 text-sm font-semibold">Price</p>
        <input
          v-model="price"
          type="text"
          placeholder="Price"
          class="w-full p-2 border rounded text-gray-900 placeholder:text-gray-900 placeholder:text-sm border-gray-900"
        />
      </div>
      <div class="w-full flex flex-col justify-start items-start gap-2">
        <p class="text-gray-900 text-sm font-semibold">Type</p>
        <select
          v-model="type"
          @change="typeValue(type)"
          placeholder="Type"
          class="w-full p-2 border rounded text-gray-900 placeholder:text-gray-900 placeholder:text-sm border-gray-900"
        >
          <option disabled value="">Select type</option>
          <option v-for="tp in adType" :key="tp.value" :value="tp.value">
            {{ tp.title }}
          </option>
        </select>
      </div>

      <div class="w-full flex flex-col justify-start items-start gap-2">
        <p v-if="if_discount" class="text-gray-900 text-sm font-semibold">Discount</p>
        <input
          v-if="if_discount"
          v-model="discount"
          type="text"
          placeholder="Discount price"
          class="w-full p-2 border rounded text-gray-900 placeholder:text-gray-900 placeholder:text-sm border-gray-900"
        />
      </div>

      <div class="flex gap-2">
        <p class="text-gray-900 placeholder:gray-900">Add Discount</p>

        <input
          v-model="if_discount"
          type="checkbox"
          placeholder="If Discount"
          class="p-2 border rounded text-gray-900 placeholder:gray-900"
        />
      </div>

      <div v-if="imageUrl" class="mt-4">
        <p class="text-sm text-gray-600">Preview:</p>
        <img :src="imageUrl" alt="Preview" class="w-48 h-auto mt-2 rounded text-gray-900" />
      </div>

      <div class="w-full flex flex-col justify-start items-start gap-2">
        <p v-if="if_discount" class="text-gray-900 text-sm font-semibold">Image</p>
        <input
          ref="fileInputRef"
          type="file"
          multiple
          @change="onFileChange"
          class="w-full text-gray-900 placeholder:text-gray-900 placeholder:text-sm border border-gray-900"
        />
      </div>

      <div v-if="errorMessage" class="text-red-600 text-md font-light">{{ errorMessage }}</div>
      <div v-if="uploadError !== '' && !disabledComputed" class="text-center text-md text-red-400">
        {{ uploadError }}
      </div>
    </div>
    <button
      type="submit"
      :disabled="!disabledComputed"
      @click="[handleUpload(), (uploadError = 'All fields are required')]"
      :class="
        disabledComputed
          ? 'w-[100%] absolute bottom-1 left-0 bg-green-500 px-4 py-3 mt-4  rounded text-gray-200 font-semibold placeholder:gray-200 cursor-pointer'
          : 'w-[100%] absolute bottom-1 left-0 bg-gray-500 px-4 py-3 mt-4 rounded text-lg text-gray-200  font-semibold  placeholder:gray-200 cursor-pointer'
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

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
