<script setup lang="ts">
import { ref, toRefs, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '@/stores/current-user-store'
// import type { UserType } from '@/types/user-type'
import type { Tables } from '@/types/supabase'
import { Icon } from '@iconify/vue'
import { useSupabaseSubscription } from '@/composables/useSupabaseSubscription'
import { useWindowSize } from '@/composables/useWindowSize'
const { isPhone } = useWindowSize()

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const { subscribe, unsubscribe } = useSupabaseSubscription()

const onAddInfo = ref<boolean>(false)
const onEditInfo = ref<boolean>(false)
// const getUser = supabase.auth.getUser()
const description = ref<string>('')
const location = ref<string>('')
const tel = ref<string>('')
const name = ref<string | null>('')
const error = ref<string>('')

const imageUrl = ref<string | null>('')
const file = ref<File | null>(null)
const info = ref<Tables<'user'>>({
  created_at: '',
  name: '',
  email: '',
  id: '',
  img: '',
  description: '',
  location: '',
  tel: '',
  user_id: '',
})

const reset = () => {
  description.value = ''
  location.value = ''
  tel.value = ''
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
  }
}
const addInfo = async (description: string, location: string, tel: string) => {
  console.log(user.value.id)
  const { data, error } = await supabase
    .from('user')
    .update({
      description: description,
      location: location,
      tel: tel,
    })
    .eq('user_id', user.value.id)
  console.log(data, error)
  reset()
  onAddInfo.value = false
}

const editInfo = async (
  name: string | null,
  description: string,
  location: string,
  tel: string,
  file: File,
) => {
  const filePath = `user-${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('ads')
    .upload(filePath, file ?? 'empty.jpg')

  if (uploadError) {
    console.error('Upload fehlgeschlagen:', uploadError.message)
    return
  }

  const { data: publicData } = supabase.storage.from('ads').getPublicUrl(filePath)

  imageUrl.value = publicData.publicUrl
  console.log(user.value.id)
  const { data, error } = await supabase
    .from('user')
    .update({
      name: name,
      description: description,
      location: location,
      tel: tel,
      img: imageUrl.value,
    })
    .eq('user_id', user.value.id)
  console.log(data, error)
  reset()
  onEditInfo.value = false
}

const getInfo = async (id: string) => {
  const { data, error } = await supabase.from('user').select('*').eq('user_id', id)
  console.log(data, error)
  if (data) {
    info.value = data[0]
    user.value = data[0]
  }
}

const openEdit = async () => {
  name.value = info.value?.name
  description.value = info.value?.description ?? ''
  location.value = info.value?.location ?? ''
  tel.value = info.value?.tel ?? ''
  imageUrl.value = info.value?.img
  if (info.value?.img) {
    const response = await fetch(info.value?.img)
    const blob = await response.blob()
    file.value = new File([blob], 'image.jpg', { type: blob.type })
  }
  onEditInfo.value = !onEditInfo.value
}

// function subscribeToProfile(user_id: string, callback: (newMessage: any) => void) {
//   console.log(user_id)
//   return supabase
//     .channel(`room:${user_id}`)
//     .on(
//       'postgres_changes',
//       {
//         event: '*',
//         schema: 'public',
//         table: 'user',
//         filter: `user_id=eq.${user_id}`,
//       },
//       (payload) => callback(payload.new),
//     )
//     .subscribe()
// }
onMounted(async () => {
  // transformCheckValue()
  // await getChat()
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('user_id', user.value.id)
    .single()
  console.log(data)
  if (!error) {
    info.value = data
  }
  await getInfo(user.value.id)
  subscribe(
    {
      event: '*',
      schema: 'public',
      table: 'user',
      filter: `user_id=eq.${user.value.id}`,
    },
    (payload) => {
      console.log('Neue Nachricht:', payload)
      getInfo(user.value.id)
    },
  )
  // subscribeToProfile(user.value.id, (newMessage) => {
  //   console.log('Neue Nachricht:', newMessage)
  //   getInfo(user.value.id)
  // })
})
onMounted(() => {
  getInfo(user.value.id)
})
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

// function handleEdit() {
//   if (file.value !== null) {
//     editInfo(name.value, description.value, location.value, tel.value, file.value)
//   }
// }
</script>
<template>
  <!-- Add deleted chats and profile for every chat user chats with  -->
  <div class="w-full h-full bg-gray-100 py-4">
    <div :class="isPhone ? 'w-[100%] mx-auto' : 'w-[60%] mx-auto'">
      <div
        :class="
          isPhone
            ? 'w-full flex flex-col justify-center items-start gap-4 p-4 my-10  '
            : 'w-full flex flex-col justify-center items-start gap-4 m-10 p-10'
        "
      >
        <div class="flex justify-start items-center gap-6">
          <div>
            <img
              :src="info.img ?? ''"
              class="rounded-full object-cover w-[150px] h-[150px]"
              width="150"
              height="150"
              alt=""
            />
          </div>
          <div class="flex flex-col justify-center items-start gap-2">
            <div class="text-xl text-gray-800 font-mono truncate">{{ info.name }}</div>
            <div class="text-md text-gray-800 font-mono truncate">{{ info.email }}</div>
          </div>
        </div>
        <!-- <div class="px-4 py-2 text-md text-gray-800 rounded-lg font-mono">{{ user.id }}</div> -->
      </div>
    </div>

    <!-- add section -->
    <div
      :class="
        isPhone
          ? 'w-[90%] mx-auto bg-gray-100 p-4 rounded-md'
          : 'w-[70%] mx-auto bg-gray-100 p-4 rounded-md'
      "
    >
      <div class="text-center text-xl font-stretch-ultra-expanded">Main info</div>
      <div class="flex flex-col gap-4 p-4">
        <div
          v-if="!onAddInfo && !onEditInfo"
          :class="
            !onAddInfo && info.description == '' && info.location == '' && info.tel == ''
              ? ' flex justify-between items-center'
              : ' flex justify-end items-center'
          "
        >
          <button
            v-if="!onAddInfo && info.description == '' && info.location == '' && info.tel == ''"
            @click="onAddInfo = !onAddInfo"
            class="px-4 py-2 border-b-2 border-gray-900 text-gray-800 text-md font-bold shadow"
          >
            Add main information
          </button>
          <button
            @click="openEdit"
            class="px-4 py-2 border-b-2 border-gray-900 text-gray-800 text-md font-bold shadow"
          >
            Edit
          </button>
        </div>

        <div
          :class="
            isPhone
              ? 'w-full flex flex-col justify-start items-start relative'
              : 'w-full flex  justify-start items-start relative'
          "
        >
          <div v-if="isPhone ? !onAddInfo && !onEditInfo : !onAddInfo" class="text-black w-1/2 p-4">
            <div class="flex flex-col justify-start items-start gap-8">
              <div class="flex justify-start items-center gap-2">
                <div class="text-md font-semibold text-gray-600">Main information</div>
                <Icon icon="mdi:eye" width="20" height="20" />
              </div>
              <div class="flex flex-col gap-4 px-4">
                <div class="flex flex-col gap-2">
                  <p class="text-gray-800 text-sm font-extralight">Description</p>
                  <p v-if="info.description == ''" class="px-4">there is no description</p>
                  <p v-else class="px-4">{{ info.description }}</p>
                </div>
                <div class="flex flex-col gap-4">
                  <p class="text-gray-800 text-sm font-extralight">Location</p>
                  <p v-if="info.location == ''" class="px-4">there is no location</p>
                  <p v-else class="px-4">{{ info.location }}</p>
                </div>
                <div class="flex flex-col gap-4">
                  <p class="text-gray-800 text-sm font-extralight">Tel</p>
                  <p v-if="info.tel == ''" class="px-4">there is no tel</p>
                  <p v-else class="px-4">{{ info.tel }}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="!isPhone && !onAddInfo"
            class="h-[100px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow border border-gray-200"
          ></div>

          <!--  edit section -->
          <div
            v-if="onEditInfo"
            :class="isPhone ? 'w-1/1 mx-auto p-4 bg-gray-100' : 'w-1/2 mx-auto p-4 bg-gray-100'"
          >
            <div v-if="isPhone" class="text-md font-semibold text-gray-600 p-4">
              Edit main information
            </div>
            <div class="flex flex-col justify-center items-center gap-4">
              <div class="w-2/3">
                <p class="text-gray-800 text-sm font-extralight p-1">Name</p>
                <input
                  v-model="name"
                  type="text"
                  placeholder="Add my name"
                  class="w-full focus:outline-none shadow px-4 py-2"
                />
              </div>

              <div class="w-2/3">
                <p class="text-gray-800 text-sm font-extralight p-1">Description</p>
                <input
                  v-model="description"
                  type="text"
                  placeholder="Add my description"
                  class="w-full focus:outline-none shadow px-4 py-2"
                />
              </div>
              <div class="w-2/3">
                <p class="text-gray-800 text-sm font-extralight p-1">Location</p>
                <input
                  v-model="location"
                  type="text"
                  placeholder="Add my location"
                  class="w-full focus:outline-none shadow px-4 py-2"
                />
              </div>
              <div class="w-2/3">
                <p class="text-gray-800 text-sm font-extralight p-1">Tel</p>
                <input
                  v-model="tel"
                  type="text"
                  placeholder="Add my tel"
                  class="w-full focus:outline-none shadow px-4 py-2"
                />
              </div>
              <div v-if="imageUrl" class="mt-4 w-2/3 p-2">
                <p class="text-gray-800 text-sm font-extralight p-1">Image</p>
                <div class="w-full flex justify-center items-center">
                  <img
                    :src="imageUrl"
                    alt="Preview"
                    class="w-[50px] h-[50px] mt-2 rounded-full text-gray-200 placeholder:gray-200"
                  />
                </div>
              </div>

              <input type="file" @change="onFileChange" class="text-gray-900 p-2 shadow w-2/3" />

              <div class="text-red-600">{{ error }}</div>
              <div class="flex justify-start items-center gap-4 p-4">
                <button
                  @click="onEditInfo = !onEditInfo"
                  class="px-4 py-2 border-b-2 border-gray-900 text-gray-800 text-md font-bold shadow"
                >
                  Cancel
                </button>
                <!-- make the enter key work -->
                <button
                  @click="
                    file !== null
                      ? editInfo(name, description, location, tel, file)
                      : (error = 'please upload image')
                  "
                  @keydown.enter="
                    file !== null ? editInfo(name, description, location, tel, file) : null
                  "
                  class="px-4 py-2 border-b-2 border-gray-900 text-gray-800 text-md font-bold shadow"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="onAddInfo"
          :class="
            isPhone
              ? 'flex flex-col  justify-center items-center gap-4 w-[100%] '
              : 'flex flex-col justify-center items-center gap-4 w-[100%] '
          "
        >
          <div
            v-if="onAddInfo && info.description == '' && info.location == '' && info.tel == ''"
            :class="
              isPhone ? 'w-1/1 mx-auto flex flex-col  gap-4' : 'w-1/2 mx-auto flex flex-col gap-4'
            "
          >
            <div class="px-4 py-2 shadow">
              <input
                v-model="description"
                type="text"
                placeholder="Add my description"
                class="w-full focus:outline-none"
              />
            </div>
            <div class="px-4 py-2 shadow">
              <input
                v-model="location"
                type="text"
                placeholder="Add my location"
                class="w-full focus:outline-none"
              />
            </div>
            <div class="px-4 py-2 shadow">
              <input
                v-model="tel"
                type="text"
                placeholder="Add my tel"
                class="w-full focus:outline-none"
              />
            </div>
          </div>

          <div class="flex justify-start items-center gap-4 p-4">
            <button
              @click="onAddInfo = !onAddInfo"
              class="px-4 py-2 border-b-2 border-gray-900 text-gray-800 text-md font-bold shadow"
            >
              Cancel
            </button>
            <button
              @click="addInfo(description, location, tel)"
              class="px-4 py-2 border-b-2 border-gray-900 text-gray-800 text-md font-bold shadow"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
