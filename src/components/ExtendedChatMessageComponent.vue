<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRefs, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useGetUserStore } from '@/stores/current-user-store'
import Button from './ui/button/Button.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { Icon } from '@iconify/vue'
import { useChatStore } from '@/stores/chat-store'
import EmojiMessageComponent from '@/components/EmojiMessageComponent.vue'

import { useSupabaseSubscription } from '@/composables/useSupabaseSubscription'

import { useWindowSize } from '@/composables/useWindowSize'
import type { Tables } from '@/types/supabase'
const { isPhone } = useWindowSize()
const chatStore = useChatStore()
const { subscribe, unsubscribe } = useSupabaseSubscription()
const router = useRouter()
const chat = chatStore.currentChat
console.log(chat, 'chat')

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const route = useRoute()
const id = route.params.id
console.log(id, 'id')
const otherUser = ref<Tables<'user'> | null>(null)

const messages = ref<Tables<'messages'>[]>([])
const message = ref('')
const errorMessage = ref('')
const certainRoom = ref<Tables<'chat_rooms'>[] | null>([])
const isMessagePanelOpen = ref(false)
const onMessagePanelOpen = ref('')
const isEditPanelOpen = ref(false)
const editMessage = ref<string | null>(null)
const fileInput = ref({} as HTMLInputElement)
const fileUrl = ref<string | null>(null)
const file = ref<File | null>(null)
const picDescription = ref<string>('')
const error = ref<string>('')
const fullSize = ref<boolean>(false)
const fullSizeVal = ref<string>('')
const isGroup = ref<boolean>(false)
const showPickerMessage = ref(false)
const showPickerImg = ref(false)

const triggerFileInput = () => {
  ;(fileInput.value as HTMLInputElement)?.click()
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
    fileUrl.value = URL.createObjectURL(file.value)
  }
}

const deleteRoom = async (room_id: string) => {
  console.log(room_id)
  const { error: roomError } = await supabase.from('chat_rooms').delete().eq('room_id', id)
  const { error: messageError } = await supabase.from('messages').delete().eq('room_id', id)
  if (roomError || messageError) {
    console.log(error)
  }
  router.push('/chats')
}

const getMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', id)
    .order('created_at', { ascending: true })

  console.log(data)
  if (!error) {
    messages.value = data
  }
}

const sendMessage = async (room_id: string | string[], sender_id: string, text: string) => {
  console.log(room_id, sender_id, text)
  if (text.length <= 0) {
    errorMessage.value = 'Message field must contain at least one character'
    return
  }
  const { error } = await supabase.from('messages').insert([
    {
      room_id: room_id,
      sender_id: sender_id,
      content: text,
      user_img: user.value.img,
      user_name: user.value.name,
    },
  ])
  if (error) {
    console.log(error)
  } else {
    message.value = ''
    errorMessage.value = ''
    showPickerMessage.value = false
  }
}
const onIsEditPanelOpen = (message: string | null) => {
  console.log(message)
  editMessage.value = message
  isEditPanelOpen.value = true
}
const toggleMessagePanel = (id: string) => {
  isMessagePanelOpen.value = !isMessagePanelOpen.value
  onMessagePanelOpen.value = id
}

const deleteMessage = async (id: string) => {
  console.log(id)

  const { error } = await supabase.from('messages').delete().eq('id', id)
  if (error) {
    console.log(error)
  }
  isMessagePanelOpen.value = false
}

const sendPhoto = async (
  room_id: string | string[],
  sender_id: string,
  file: File,
  description: string,
) => {
  console.log(room_id, sender_id, file, description)
  const filePath = `user-${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('messages')
    .upload(filePath, file ?? 'empty.jpg')

  if (uploadError) {
    console.error('Upload fehlgeschlagen:', uploadError.message)
    return
  }
  const { data: publicData } = supabase.storage.from('messages').getPublicUrl(filePath)

  fileUrl.value = publicData.publicUrl
  console.log(user.value.id)
  const { data, error } = await supabase.from('messages').insert({
    room_id: room_id,
    sender_id: sender_id,
    content: description,
    pic: fileUrl.value,
    user_img: user.value.img,
    user_name: user.value.name,
  })
  const reset = () => {
    picDescription.value = ''
    fileUrl.value = null
  }
  reset()
  console.log(data, error)
}

const makeFullSize = (val: string) => {
  console.log(val)

  fullSizeVal.value = val
  console.log(fullSizeVal.value)
  console.log(fullSize.value)

  if (fullSize.value) {
    fullSize.value = false
  } else {
    fullSize.value = true
  }
  return
}

const updateMessage = async (
  room_id: Tables<'messages'>['room_id'],
  id: Tables<'messages'>['id'],
  message: Tables<'messages'>['content'],
  created_at: Tables<'messages'>['created_at'],
) => {
  console.log(id)
  console.log(message)

  const { error } = await supabase
    .from('messages')
    .update({
      content: message,
      created_at: created_at,
    })
    .eq('room_id', room_id)
    .eq('id', id)

  if (error) {
    console.log(error)
  }
  isMessagePanelOpen.value = false

  isEditPanelOpen.value = false
}

const getRoom = async () => {
  const { data } = await supabase.from('chat_rooms').select('*').eq('room_id', id)
  console.log(data)
  certainRoom.value = data
  isGroup.value = data?.[0].is_group ? true : false
}

const otherUserId = computed(() => {
  if (
    chat?.participant_ids?.[0] === chat?.participant_ids?.[1] &&
    chat?.participant_ids?.[0] === user.value.id
  ) {
    return chat?.participant_ids?.find((id: string) => id == user.value.id)
  } else {
    return chat?.participant_ids?.find((id: string) => id !== user.value.id)
  }
})

const getUser = async (id: string | undefined) => {
  console.log(id)
  const { data } = await supabase.from('user').select('*').eq('user_id', id).maybeSingle()

  otherUser.value = data
}

const scrollToBottom = () => {
  const container = document.getElementById('messages-container')
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,

      behavior: 'smooth',
    })
  }
}
// Scroll after messages update
watch(messages, async () => {
  await nextTick()
  scrollToBottom()
})

onMounted(() => {
  subscribe<{
    content: string | null
    created_at: string
    id: string
    pic: string | null
    room_id: string
    sender_id: string | null
  }>(
    {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.${id}`,
    },
    (payload) => {
      console.log('Realtime change:', payload)

      const { eventType, new: newMessage, old: oldMessage } = payload

      if (eventType === 'INSERT') {
        messages.value.push(newMessage)
        nextTick(() => scrollToBottom())
      }
      if (eventType === 'UPDATE') {
        const index = messages.value.findIndex((msg) => msg.id === newMessage.id)
        if (index !== -1) {
          messages.value[index] = newMessage
        }
      }

      if (eventType === 'DELETE') {
        messages.value = messages.value.filter((msg) => msg.id !== oldMessage.id)
      }
    },
  )

  getMessages()
  getRoom()
  if (isGroup.value === false) {
    getUser(otherUserId.value)
  }

  scrollToBottom()
})
onUnmounted(() => {
  unsubscribe()
})
</script>

<template>
  <div class="w-[100vw] min-h-[calc(100vh-0px)] h-full p-0 bg-gray-300 relative">
    <div
      v-if="fileUrl"
      class="w-[100vw] h-[100vh] fixed cursor-pointer z-10 flex justify-center items-center"
    >
      <div
        :class="
          isPhone
            ? 'w-[90%] h-[50vh] flex flex-col justify-center items-center gap-10 bg-white rounded-sm relative '
            : 'w-[400px] h-[400px] flex flex-col justify-center items-center gap-10 bg-white rounded-sm relative'
        "
      >
        <div :class="isPhone ? 'absolute top-6 left-6' : 'absolute top-4 left-4'">
          <Icon
            @click="((fileUrl = null), (picDescription = ''))"
            icon="mdi:close"
            class="text-black w-[30px] h-[30px]"
          />
        </div>
        <img v-if="fileUrl" :src="fileUrl" alt="Selected image" class="w-50 h-50 object-cover" />
        <div class="flex justify-center items-center gap-4 relative">
          <div class="">
            <EmojiMessageComponent
              v-model="picDescription"
              :showPicker="showPickerImg"
              @update:showPicker="(val: boolean) => (showPickerImg = val)"
            />
          </div>

          <textarea
            @keydown.enter.shift.stop
            @keydown.exact.enter="
              file !== null ? sendPhoto(id, user.id, file, picDescription) : null
            "
            type="text"
            :rows="picDescription.length > 20 ? 3 : 1"
            placeholder="Add a description"
            v-model="picDescription"
            class="w-full shadow py-1 resize-none placeholder-black text-black rounded-md px-4"
          ></textarea>

          <div class="w-[40px] h-[40px]">
            <div class="flex justify-center items-center">
              <Button
                :disabled="!fileUrl"
                @click="
                  file !== null
                    ? sendPhoto(id, user.id, file, picDescription)
                    : (error = 'please upload image')
                "
                class="w-[40px] h-[40px] flex items-center rounded-full"
                ><Icon icon="mdi:send" width="40" height="40" class="text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full h-[80px] flex justify-between items-center gap-4 bg-black text-white">
      <RouterLink v-if="!isGroup" :to="'/user-profile/' + otherUserId">
        <div class="flex justify-start items-center gap-4 px-8 py-1">
          <div class="w-[50px] h-[50px]">
            <img
              :src="
                otherUser?.img === null
                  ? 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                  : otherUser?.img
              "
              alt=""
              width="50"
              height="50"
              class="border border-black w-[50px] h-[50px] object-cover rounded-full"
            />
          </div>
          <div>
            <h1>
              {{ otherUser?.name }}
              <p v-if="otherUser?.name === null">Anonymous</p>
            </h1>
          </div>
        </div>
      </RouterLink>
      <div
        v-else
        v-for="item in certainRoom"
        :key="item.room_id"
        class="w-full flex justify-start items-center gap-4 px-8 py-1"
      >
        <!-- img of group of people or avatars -->
        <div class="w-[50px] h-[50px]">
          <img
            :src="'data:image/png;base64,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'"
            alt=""
            width="50"
            height="50"
            class="border border-black w-[50px] h-[50px] object-cover rounded-full"
          />
        </div>
        <p>{{ item.room_topic }}</p>
      </div>

      <div
        class="absolute top-center right-1 bg-transparent p-0 rounded-full hover:bg-transparent"
        v-for="item in certainRoom"
        :key="item.room_id"
      >
        <Button
          v-if="!item.is_group || (item.is_group === true && item.admin === user.id)"
          class="bg-transparent p-0 rounded-full hover:bg-transparent"
        >
          <ConfirmDialog
            message="Are you sure you want to delete this chat?"
            confirmText="Delete"
            cancelText="Cancel"
            item="chat"
            icon="mdi:dots-vertical"
            text_color="text-white"
            @confirm="() => deleteRoom(id as string)"
          />
        </Button>
      </div>
    </div>

    <div
      id="messages-container"
      :class="
        isPhone
          ? 'w-full overflow-y-auto h-[80vh] px-2  py-[15%] pb-[10%] z-10 transition-all transform duration-1000'
          : 'w-full overflow-y-auto h-[80vh] px-20 py-[5%] pb-[10%] z-10 transition-all transform duration-1000l'
      "
    >
      <div class="w-full p-4 relative" v-for="item in messages" :key="item.id">
        <div
          :class="
            item.sender_id === user.id ? 'w-full flex justify-end ' : 'w-full flex justify-start'
          "
          class="w-fit h-fit flex justify-end"
        >
          <RouterLink
            :to="'/user-profile/' + item.sender_id"
            v-if="item.sender_id !== user.id"
            class="pr-2 flex justify-center items-end gap-2"
          >
            <img
              v-if="item.user_img"
              :src="item.user_img"
              alt=""
              width="40"
              height="40"
              class="w-[40px] h-[40px] rounded-full"
            />
          </RouterLink>

          <!-- add users photo i am chating with -->

          <div
            :class="
              item.sender_id === user.id
                ? 'min-w-[100px] text-right  bg-green-700 text-gray-300  rounded-lg w-fit flex flex-wrap justify-end   max-w-fit md:max-w-[60vw] relative'
                : ' min-w-[100px] text-left bg-gray-800 text-gray-300  rounded-lg w-fit flex justify-start max-w-fit md:max-w-[60vw] relative'
            "
          >
            <RouterLink
              :to="'/user-profile/' + item.sender_id"
              v-if="item.sender_id !== user.id && item.user_name"
              class="px-4 w-fit min-w-[200px] flex justify-start items-center gap-2 absolute bottom-full left-0"
            >
              <div
                v-for="i in certainRoom"
                :key="i.room_id"
                class="w-full flex justify-start items-center gap-1"
              >
                <p v-if="i.admin === item.sender_id" class="text-red-600 text-sm font-semibold">
                  admin
                </p>

                <p class="text-black text-sm md:text-md font-light">~{{ item.user_name }}</p>
              </div>
            </RouterLink>
            <div
              @click="toggleMessagePanel(item.id)"
              v-if="item.sender_id === user.id"
              :class="
                item.sender_id === user.id && item.pic !== null
                  ? 'text-xs text-gray-300 absolute top-4 right-2 translate-x-0 -translate-y-1/2 rounded-full bg-gray-950 p-1 cursor-pointer'
                  : 'text-xs text-gray-300 absolute top-4 right-0 translate-x-0 -translate-y-1/2 cursor-pointer'
              "
            >
              <Icon icon="mdi:dots-vertical" width="20" height="20" class="" />
              <div
                v-if="isMessagePanelOpen && item.id === onMessagePanelOpen"
                :class="
                  isEditPanelOpen
                    ? 'w-[300px] md:w-[400px] flex flex-col justify-center items-center absolute bottom-full right-2 bg-gray-950 p-1 rounded-md mb-1  shadow-xl transform transition-all duration-1000 '
                    : 'w-[100px] md:w-[100px] flex flex-col justify-center items-center absolute bottom-full right-2 bg-gray-950 p-1 rounded-md mb-1  shadow-xl transform transition-all duration-1000 '
                "
              >
                <div
                  v-if="!isEditPanelOpen"
                  @click.stop="deleteMessage(item.id)"
                  class="w-full flex justify-center items-center text-white bg-gray-800 px-4 py-2 text-sm font-extralight"
                >
                  Delete
                </div>
                <div
                  v-if="!isEditPanelOpen"
                  class="w-full flex justify-center items-center border-b border-gray-200"
                ></div>
                <div
                  @click.stop="onIsEditPanelOpen(item.content)"
                  class="w-full flex flex-col px-2 md:px-4 py-2 justify-center items-center text-white bg-gray-800 text-sm font-extralight"
                >
                  <div v-if="!isEditPanelOpen">Edit</div>
                  <div v-if="isEditPanelOpen" class="w-full flex justify-center items-center gap-2">
                    <div>
                      <Icon
                        @click.stop="isEditPanelOpen = false"
                        icon="mdi:close"
                        width="25"
                        height="25"
                        class="text-white"
                      />
                    </div>
                    <textarea
                      v-model="editMessage"
                      :rows="(editMessage?.length ?? 0) > 45 ? 3 : 1"
                      placeholder="Edit your message..."
                      class="w-full p-2 rounded-md border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                    ></textarea>

                    <Button
                      :disabled="(editMessage?.length ?? 0) <= 0"
                      @click="
                        updateMessage(
                          id as Tables<'messages'>['room_id'],
                          item.id as Tables<'messages'>['id'],
                          editMessage as Tables<'messages'>['content'],
                          item.created_at as Tables<'messages'>['created_at'],
                        )
                      "
                      class="w-[40px] h-[40px] flex items-center rounded-full"
                      ><Icon icon="mdi:send" width="40" height="40" class="text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div class="w-full h-full flex flex-col justify-center items-center">
              <div
                v-if="item.pic !== null"
                :class="
                  fullSize && item.id == fullSizeVal
                    ? 'w-[100vw] h-[100vh] fixed top-0 left-1/2 transform -translate-x-1/2 z-20 flex justify-center items-center bg-black '
                    : 'w-full h-full   '
                "
              >
                <div
                  :class="
                    fullSize && item.id == fullSizeVal
                      ? ' w-[100vh] h-[100vh] flex justify-center items-center bg-black  '
                      : ' w-full h-fit flex justify-end items-center break-words  bg-black '
                  "
                >
                  <img
                    @click="makeFullSize(item.id)"
                    :src="item.pic"
                    alt=""
                    :class="
                      fullSize && item.id == fullSizeVal
                        ? 'w-[90vw] h-auto md:w-[auto] md:h-auto md:max-w-[90vw] md:max-h-[90vh] object-contain mx-auto'
                        : 'w-[70vw] h-auto md:min-w-[300px] md:max-w-[500px]  md:h-auto object-cover mx-auto'
                    "
                  />

                  <button
                    v-if="fullSize && item.id == fullSizeVal"
                    class="w-full h-full absolute top-4 left-1"
                  >
                    <Icon
                      @click="fullSize = false"
                      icon="mdi:close"
                      width="40"
                      height="40"
                      class="text-white absolute top-0 left-4 cursor-pointer rounded-full bg-gray-950 p-1"
                    />
                  </button>
                </div>
              </div>
              <div
                v-if="!fullSize || item.id !== fullSizeVal"
                :class="
                  item.pic !== null && item.sender_id === user.id
                    ? ' px-6 w-fit max-w-[70vw] md:max-w-[500px] break-words self-end  rounded-sm'
                    : 'px-6 py-1 w-fit max-w-[70vw] md:max-w-[500px] break-words  self-start rounded-sm'
                "
              >
                {{ item.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="w-full h-[100px] flex gap-8 justify-center fixed bottom-0 left-0 bg-gray-50 p-2 z-10"
    >
      <div class="text-red-500 text-sm" v-if="errorMessage.length > 0">{{ errorMessage }}"</div>

      <div
        :class="
          isPhone
            ? 'flex justify-center items-center gap-4 p-1 relative'
            : 'flex justify-center items-center gap-6 p-4 relative'
        "
      >
        <div class="relative inline-block">
          <input type="file" ref="fileInput" @change="onFileChange" class="hidden" />

          <Icon
            @click="triggerFileInput"
            icon="mdi:image"
            width="34"
            height="34"
            class="w-[34px] h-[34px] text-black cursor-pointer"
          />
        </div>

        <div class="">
          <EmojiMessageComponent
            :showPicker="showPickerMessage"
            v-model="message"
            @update:showPicker="(val: boolean) => (showPickerMessage = val)"
          />
        </div>

        <textarea
          @keydown.exact.enter="sendMessage(id, user.id, message)"
          @keydown.enter.shift.stop
          type="text"
          :rows="message.length > 45 ? 3 : 1"
          placeholder="Message"
          v-model="message"
          :class="
            isPhone
              ? 'w-[50vw] shadow py-1 resize-none placeholder-black text-black rounded-md px-4'
              : 'w-[30vw] shadow py-1 resize-none placeholder-black text-black rounded-md px-4'
          "
        ></textarea>

        <div class="w-[40px] h-[40px]">
          <div v-if="message.length > 0" class="flex justify-center items-center">
            <Button
              :disabled="message.length <= 0"
              @click="sendMessage(id, user.id, message)"
              class="w-[40px] h-[40px] flex items-center rounded-full"
              ><Icon icon="mdi:send" width="40" height="40" class="text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
