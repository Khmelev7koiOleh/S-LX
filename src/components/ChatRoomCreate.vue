<script setup lang="ts">
import { computed, onMounted, ref, toRefs } from 'vue'

import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { supabase } from '../lib/supabaseClient'

import { Icon } from '@iconify/vue'
import { useGetUserStore } from '../stores/current-user-store'
import type { Tables } from '@/types/supabase'
import { useChatStore } from '../stores/chat-store'
import { useWindowSize } from '../composables/useWindowSize'
import { useRouter } from 'vue-router'
const { isPhone } = useWindowSize()
const router = useRouter()
const chatStore = useChatStore()

const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const onCreateRoomOpen = ref<boolean>(false)
const roomName = ref<string>('')
const filterRoomsValue = ref<string>('')
const groupRooms = ref<
  | {
      created_at: string
      id: string | null
      participant_ids: string[] | null
      room_id: string
      room_topic: string | null
      is_group: boolean
      admin: string | null
    }[]
  | null
>(null)

async function createChatRoom(user_id: string) {
  console.log(user_id)
  const room_id = user_id + '-' + roomName.value
  console.log(room_id)
  const { data } = await supabase
    .from('chat_rooms')
    .upsert(
      {
        room_id: room_id,
        participant_ids: [user_id],
        room_topic: roomName.value,
        is_group: true,
        admin: user_id,
      },
      { onConflict: 'room_id' },
    )
    .select()
    .single()

  if (data) {
    router.push(`/chats/${room_id}`) // Navigate
  }
  // goToChat(room_id as unknown as Tables<'chat_rooms'>)
  // currentRoom.value = data

  return data
}

// const goToChat = async (chat: Tables<'chat_rooms'>) => {
//   console.log(chat)
//   // add to partisipants my id
//   const { error } = await supabase.from('chat_rooms').update({
//     participant_ids: chat.participant_ids?.push(user.value.id),
//   })
//   if (error) {
//     console.error('Error fetching chat rooms:', error)
//     return
//   } else {
//     chatStore.currentChat = chat // Store the chat
//     router.push(`/chats/${chat.room_id}`) // Navigate
//   }
// }
// const goToChat = async (chat: Tables<'chat_rooms'>) => {
//   console.log(chat)
//   // add to partisipants my id
//   const { error } = await supabase
//     .from('chat_rooms')
//     .update({
//       participant_ids: chat.participant_ids?.push(user.value.id),
//     })
//     .select()
//     .single()
//   if (error) {
//     console.error('Error fetching chat rooms:', error)
//     return
//   } else {
//     chatStore.currentChat = chat // Store the chat
//     router.push(`/chats/${chat.room_id}`) // Navigate
//   }
// }

const goToChat = async (chat: Tables<'chat_rooms'>) => {
  console.log(chat)

  const currentParticipants = chat.participant_ids ?? []

  // add my id, but make sure no duplicates
  const updatedParticipants = Array.from(new Set([...currentParticipants, user.value.id]))

  const { error, data } = await supabase
    .from('chat_rooms')
    .update({ participant_ids: updatedParticipants })
    .eq('room_id', chat.room_id) // ✅ specify which room
    .select()
    .single()

  if (error) {
    console.error('Error updating chat room:', error)
    return
  } else {
    chatStore.currentChat = data
    router.push(`/chats/${chat.room_id}`)
  }
}

const itemsPerPage = 5
const getGroupChats = async () => {
  const { data } = await supabase.from('chat_rooms').select('*').eq('is_group', [true])
  groupRooms.value = data
  console.log(data)
}
const filteredRooms = computed(() => {
  return groupRooms.value?.filter((room) =>
    room.room_topic?.toLowerCase().includes(filterRoomsValue.value.toLowerCase()),
  )
})

const getPaginatedChats = (page: number) => {
  const start = (page - 1) * itemsPerPage

  return filteredRooms?.value?.slice(start, start + itemsPerPage)
}

const reset = () => {
  roomName.value = ''
}
onMounted(() => {
  getGroupChats()
})
</script>
<template>
  <div class="w-full flex flex-col justify-end items-center gap-4 px-4 relative">
    <div class="w-full flex justify-between items-start gap-4 px-[4px] md:px-[10vw] pt-4">
      <div class="relative px-4 border-b border-black">
        <input
          v-model="filterRoomsValue"
          type="text"
          class="p-1 px-3 outline-none"
          placeholder="Search..."
        />
        <Icon
          icon="ph:magnifying-glass"
          width="20"
          height="20"
          class="text-black absolute top-1/2 left-0 -translate-y-1/2"
        />
      </div>

      <!-- <div>
      <div v-for="item in groupRooms" :key="item.room_id">
        <RouterLink
          :to="`/chats/${item.room_id}`"
          :key="item.room_id"
          class="p-1 px-3 rounded-md text-black"
        >
          {{ item.room_topic }}</RouterLink
        >
      </div>
    </div> -->
      <button
        @click="onCreateRoomOpen = !onCreateRoomOpen"
        class="flex justify-center items-center gap-2 bg-green-500 p-2 px-4 rounded-md"
      >
        <Icon icon="radix-icons:plus" width="28" height="28" class="text-white" />
        <p v-if="!isPhone" class="text-white text-lg">Create a room</p>
      </button>
    </div>
    <div
      v-if="onCreateRoomOpen"
      class="w-[95vw] md:w-[400px] h-[50vh] fixed top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gray-100"
    >
      <div class="absolute top-4 left-4 w-full flex justify-start items-center gap-4">
        <button @click="[(onCreateRoomOpen = !onCreateRoomOpen), reset()]">
          <Icon
            icon="material-symbols:arrow-back"
            width="34"
            height="34"
            class="cursor-pointer hover:scale-125"
          />
        </button>
        <h1 class="text-xl font-semibold">Create a room</h1>
      </div>

      <div class="w-full h-[100%] flex flex-col justify-center items-center gap-14">
        <div class="w-full flex justify-center items-center">
          <textarea
            @keydown.enter.shift.stop
            @key-up.exact.enter="createChatRoom(user.id)"
            v-model="roomName"
            :rows="roomName.length > 35 ? 3 : 1"
            type="text"
            class="w-[70%] border border-black p-1 px-2 rounded-md"
            placeholder="Room name"
          />
        </div>

        <div class="w-full flex justify-center items-center gap-4">
          <Button
            @click="[(onCreateRoomOpen = !onCreateRoomOpen), reset()]"
            class="w-[30%] bg-gray-100 text-black font-semibold shadow shadow-gray-900"
            >Cancel</Button
          >
          <Button
            class="w-[30%] bg-gray-900 text-white font-semibold shadow shadow-gray-900"
            @click="createChatRoom(user.id)"
            >Create</Button
          >
        </div>
      </div>
    </div>

    <Pagination
      class="w-full flex flex-col justify-center items-center gap-10"
      v-slot="{ page }"
      :items-per-page="itemsPerPage"
      :total="groupRooms?.length"
      :default-page="1"
    >
      <div :class="isPhone ? ' mt-4 space-y-2 w-[90vw]' : ' mt-4 space-y-2 w-[60vw]'">
        <div v-if="filteredRooms?.length" class="w-full flex justify-start items-center gap-8 pb-2">
          <div class="w-[50%] flex justify-center items-center">
            <p class="text-md font-semibold">Topic</p>
          </div>
        </div>
        <div v-if="!filteredRooms?.length" class="w-full flex justify-center items-center">
          <p class="text-xl font-semibold text-gray-600">There are no rooms</p>
        </div>
        <div
          v-for="chat in getPaginatedChats(page)"
          :key="chat.room_id"
          class="bg-black border p-2 rounded-md"
        >
          <!-- <div class="text-red-300">{{ chat }}</div> -->
          <div @click="goToChat(chat)">
            <div
              class="w-full text-white flex justify-between items-center gap-4 px-2 min-h-[30px]"
            >
              <div class="w-[20px] h-[20px] px-2">
                <Icon icon="material-symbols:group" width="20" height="20" />
              </div>

              <div class="w-full flex justify-start items-center gap-4 md:px-[2rem]">
                <div class="w-full flex justify-start items-center gap-4">
                  <div class="truncate">{{ chat.room_topic }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PaginationContent class="fixed bottom-8" v-slot="{ items }">
        <PaginationPrevious />

        <template v-for="(item, index) in items" :key="index">
          <PaginationItem
            v-if="item.type === 'page'"
            :value="item.value"
            :is-active="item.value === page"
          >
            {{ item.value }}
          </PaginationItem>
        </template>

        <PaginationEllipsis :index="4" />
        <PaginationNext />
      </PaginationContent>
    </Pagination>
  </div>
</template>

<style scoped></style>
