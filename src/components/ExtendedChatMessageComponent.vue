<script setup lang="ts">
import { ref, onMounted, toRefs, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useGetUserStore } from '@/stores/current-user-store'
import Button from './ui/button/Button.vue'
import { Input } from '@/components/ui/input'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { Icon } from '@iconify/vue'
import { useChatStore } from '@/stores/chat-store'
import EmojiMessageComponent from '@/components/EmojiMessageComponent.vue'
import router from '@/router'
import { useWindowSize } from '@/composables/useWindowSize'
const { width, height, isPhone, isTablet, isLaptop } = useWindowSize()
const chatStore = useChatStore()

// write a type fot the chat const
// write a type fot the chat const
// write a type fot the chat const
// write a type fot the chat const
const chat: any = chatStore.currentChat // Always available
console.log(chat, 'chat')

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const route = useRoute()
const id = route.params.id
const othreUser = ref<any>(null)

const messages = ref<any>([])
const message = ref('')
const errorMessage = ref('')
const certainRoom = ref<any>([])
const isMessagePanelOpen = ref(false)
const onMessagePanelOpen = ref('')
const isEditPanelOpen = ref(false)
const editMessage = ref('')
const fileInput = ref({} as HTMLInputElement)
const fileUrl = ref<string | null>(null)
const file = ref<File | null>(null)
const picDescription = ref<string>('')
const error = ref<string>('')
const fullSize = ref<boolean>(false)
const fullSizeVal = ref<string>('')
const chatContainer = ref<HTMLElement | null>(null)
const showPickerMessage = ref(false)
const showPickerImg = ref(false)
const onRoomSettingsOpen = ref<boolean>(false)
const onDeleteRoomConfirmation = ref<boolean>(false)

const triggerFileInput = () => {
  ;(fileInput.value as HTMLInputElement)?.click()
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
    fileUrl.value = URL.createObjectURL(file.value) // ✅ Create object URL
  }
}

const deleteRoom = async (room_id: string) => {
  console.log(room_id)
  const { error: roomError } = await supabase.from('chat_rooms').delete().eq('room_id', id)
  const { error: messageError } = await supabase.from('messages').delete().eq('room_id', id)
  if (roomError || messageError) {
    console.log(error)
  }
  router.push({ name: 'chats' })
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

const sendMessage = async (room_id, sender_id, text) => {
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
const onIsEditPanelOpen = (message: string) => {
  console.log(message)
  editMessage.value = message
  isEditPanelOpen.value = true
}
const toggleMessagePanel = (id) => {
  isMessagePanelOpen.value = !isMessagePanelOpen.value
  onMessagePanelOpen.value = id
}

const deleteMessage = async (id) => {
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

  const { data: uploadData, error: uploadError } = await supabase.storage
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

const updateMessage = async (room_id, id, message, created_at) => {
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
  const { data, error } = await supabase.from('chat_rooms').select('*').eq('room_id', id)

  certainRoom.value = data
}

const otherUserId = computed(() => {
  if (
    chat?.participant_ids[0] === chat?.participant_ids[1] &&
    chat?.participant_ids[0] === user.value.id
  ) {
    return chat.participant_ids.find((id: string) => id == user.value.id)
  } else {
    return chat?.participant_ids.find((id: string) => id !== user.value.id)
  }
})

const getUser = async (id: string) => {
  console.log(id)
  const { data, error } = await supabase.from('user').select('*').eq('user_id', id).maybeSingle()

  othreUser.value = data
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
function subscribeToRoom(room_id: string, callback: (newMessage: any) => void) {
  return supabase
    .channel(`room:${room_id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${room_id}`,
      },
      (payload) => callback(payload),
    )
    .subscribe()
}
onMounted(() => {
  console.log(chat, 'chat')
  console.log('id:', id)
  subscribeToRoom(id, (payload) => {
    const { eventType, new: newMessage, old: oldMessage } = payload

    if (eventType === 'INSERT') {
      messages.value.push(newMessage)
      nextTick(() => scrollToBottom()) // this now scrolls smoothly
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
  })
  getUser(otherUserId.value)
  getMessages()
  getRoom()

  scrollToBottom()
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
            @keydown.enter="file !== null ? sendPhoto(id, user.id, file, picDescription) : null"
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
      <RouterLink :to="'/user-profile/' + otherUserId">
        <!-- some picum pic -->
        <div class="flex justify-start items-center gap-4 px-8 py-1">
          <div class="w-[50px] h-[50px]">
            <!-- just an empty avatar if there is no image -->
            <img
              :src="
                othreUser?.img === null
                  ? 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                  : othreUser?.img
              "
              alt=""
              width="50"
              height="50"
              class="border border-black w-[50px] h-[50px] object-cover rounded-full"
            />
          </div>
          <div>
            <h1>
              {{ othreUser?.name }}
              <p v-if="othreUser?.name === null">Anonymous</p>
            </h1>
          </div>
        </div>
      </RouterLink>
      <Button
        class="absolute top-center right-1 bg-transparent p-0 rounded-full hover:bg-transparent"
      >
        <!-- Delete this ad
      <Icon icon="mdi:trash-can" class="w-[20px] h-[20px] text-red-500" /> -->
        <ConfirmDialog
          message="Are you sure you want to delete this chat?"
          confirmText="Delete"
          cancelText="Cancel"
          item="chat"
          icon="mdi:dots-vertical"
          @confirm="() => deleteRoom(id as string)"
          @cancel="handleCancel"
        />
      </Button>
    </div>

    <div
      id="messages-container"
      class="w-full overflow-y-auto h-[80vh] px-20 py-[5%] pb-[10%] z-10 transition-all transform duration-1000"
    >
      <div class="w-full p-4 relative" v-for="item in messages" :key="item.id">
        <div
          :class="
            item.sender_id === user.id ? 'w-full flex justify-end ' : 'w-full flex justify-start'
          "
          class="w-fit h-fit flex justify-end"
        >
          <div
            :class="
              item.sender_id === user.id
                ? 'text-right  bg-green-700 text-gray-300  rounded-lg w-fit flex flex-wrap justify-end  max-w-[60vw] relative'
                : 'text-left bg-gray-600 text-gray-300  rounded-lg w-fit flex justify-start  max-w-[60vw]'
            "
          >
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
                    ? 'w-[400px] flex flex-col justify-center items-center absolute bottom-full right-2 bg-gray-950 p-1 rounded-md mb-1  shadow-xl transform transition-all duration-1000 '
                    : 'w-[100px] flex flex-col justify-center items-center absolute bottom-full right-2 bg-gray-950 p-1 rounded-md mb-1  shadow-xl transform transition-all duration-1000 '
                "
              >
                <div
                  @click.stop="deleteMessage(item.id)"
                  class="w-full flex justify-center items-center text-white bg-gray-800 px-4 py-2 text-sm font-extralight"
                >
                  Delete
                </div>
                <div class="w-full flex justify-center items-center border-b border-gray-200"></div>
                <div
                  @click.stop="onIsEditPanelOpen(item.content)"
                  class="w-full flex flex-col px-4 py-2 justify-center items-center text-white bg-gray-800 text-sm font-extralight"
                >
                  <div v-if="!isEditPanelOpen">Edit</div>
                  <div v-if="isEditPanelOpen" class="w-full flex justify-center items-center gap-0">
                    <div>
                      <Icon
                        @click.stop="isEditPanelOpen = false"
                        icon="mdi:close"
                        width="20"
                        height="20"
                        class="text-white"
                      />
                    </div>
                    <textarea
                      v-model="editMessage"
                      :rows="editMessage.length > 45 ? 3 : 1"
                      placeholder="Edit your message..."
                      class="w-full p-2 rounded-md border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                    ></textarea>

                    <Button
                      :disabled="editMessage.length <= 0"
                      @click="updateMessage(id, item.id, editMessage, item.created_at)"
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
                        ? ' min-w-[60%] min-h-[60%] w-fit h-fit max-w-[80vw] max-h-[80vh] object-cover flex justify-center items-center relative rounded-sm  '
                        : 'min-w-[500px] min-h-[500px]  w-fit h-fit max-w-[500px] max-h-[500px] object-cover flex justify-center items-center rounded-sm break-words '
                    "
                  />
                  <div
                    v-if="fullSize && item.id == fullSizeVal"
                    class="w-full h-full absolute top-12 left-4"
                  >
                    <Icon
                      @click="fullSize = false"
                      icon="mdi:close"
                      width="40"
                      height="40"
                      class="text-white absolute top-0 left-4 cursor-pointer rounded-full bg-gray-950 p-1"
                    />
                  </div>
                </div>
              </div>
              <div
                v-if="!fullSize || item.id !== fullSizeVal"
                :class="
                  item.pic !== null && item.sender_id === user.id
                    ? ' px-6 w-fit max-w-[500px] break-words self-end  rounded-sm'
                    : 'px-6 py-1 w-fit max-w-[800px] break-words  self-start rounded-sm'
                "
              >
                {{ item.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- footer part -->
    <div
      class="w-full h-[100px] flex gap-8 justify-center fixed bottom-0 left-0 bg-gray-50 p-2 z-10"
    >
      <div class="text-red-500 text-sm" v-if="errorMessage.length > 0">{{ errorMessage }}"</div>

      <div class="flex justify-center items-center gap-6 p-4 relative">
        <div class="relative inline-block">
          <!-- Hidden file input -->
          <input type="file" ref="fileInput" @change="onFileChange" class="hidden" />

          <!-- Clickable icon triggers input -->
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
          @keydown.enter="sendMessage(id, user.id, message)"
          type="text"
          :rows="message.length > 45 ? 3 : 1"
          placeholder="Message"
          v-model="message"
          :class="
            isPhone
              ? 'w-full shadow py-1 resize-none placeholder-black text-black rounded-md px-4'
              : 'w-[400px] shadow py-1 resize-none placeholder-black text-black rounded-md px-4'
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
