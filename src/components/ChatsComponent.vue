<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { ref, toRefs, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '../stores/current-user-store'

import { Icon } from '@iconify/vue'
import { useChatStore } from '../stores/chat-store'
import { useGetUsersComposable } from '@/composables/get-users'
import type { Tables } from '@/types/supabase'
import { useWindowSize } from '@/composables/useWindowSize'
const { isPhone } = useWindowSize()

const { users, getUsers } = useGetUsersComposable()

const chatStore = useChatStore()

const userStore = useGetUserStore()

const { user } = toRefs(userStore)

const router = useRouter()
const filterChatsValue = ref<string>('')
const chatsIn = ref<Tables<'chat_rooms'>[] | null>([])

const getRoomsCurrentUserIn = async () => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .contains('participant_ids', [user.value.id])
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching chat rooms:', error)
    return
  }
  console.log(data)
  chatsIn.value = data
  return data
}
const goToChat = (chat: Tables<'chat_rooms'>) => {
  console.log(chat)
  chatStore.currentChat = chat // Store the chat
  router.push(`/chats/${chat.room_id}`) // Navigate
}

const ids = new Set<string>()
onMounted(async () => {
  await getRoomsCurrentUserIn()

  chatsIn?.value?.forEach((chat: Tables<'chat_rooms'>) => {
    chat?.participant_ids?.forEach((id: string) => {
      if (id) ids.add(id)
    })
  })
  console.log([...ids])
  await getUsers([...ids])
})
const itemsPerPage = 5

const enrichedChats = computed(() => {
  let personalChat = ''
  if (!chatsIn?.value?.length || !users.value.length || !user.value) return []

  return chatsIn.value.map((chat: Tables<'chat_rooms'>) => {
    if (
      chat?.participant_ids?.[0] === chat?.participant_ids?.[1] &&
      chat.participant_ids?.[0 && 1] === user.value.id
    ) {
      personalChat = chat.participant_ids[0]
    }

    const otherUserId = chat?.participant_ids?.find((id: string) => id !== user.value.id)

    const otherUser = users.value.find((u) => u.id === otherUserId)
    const otherUserTwo = users.value.find((u) => u.id === personalChat)

    return {
      ...chat,
      name:
        chat?.participant_ids?.[0] === chat.participant_ids?.[1] &&
        chat?.participant_ids?.[0] === user.value.id
          ? otherUserTwo?.name || 'Unknown'
          : otherUser?.name || 'Unknown',
      img:
        chat?.participant_ids?.[0] === chat?.participant_ids?.[1] &&
        chat?.participant_ids?.[0] === user.value.id
          ? otherUserTwo?.img || null
          : otherUser?.img || null,
    }
  })
})
const filteredChats = computed(() => {
  return enrichedChats.value.filter((chats) =>
    chats.name.toLowerCase().includes(filterChatsValue.value.toLowerCase()),
  )
})
const getPaginatedChats = (page: number) => {
  const start = (page - 1) * itemsPerPage

  return filteredChats.value.slice(start, start + itemsPerPage)
}
</script>

<template>
  <div class="w-full flex flex-col justify-center items-center px-4">
    <div class="w-full flex justify-center md:justify-start items-start px-8 md:px-[10vw] pt-4">
      <div class="w-full md:w-fit relative px-4 border-b border-black">
        <input
          v-model="filterChatsValue"
          type="text"
          class="w-full p-1 px-3 outline-none"
          placeholder="Search..."
        />
        <Icon
          icon="ph:magnifying-glass"
          width="20"
          height="20"
          class="text-black absolute top-1/2 left-0 -translate-y-1/2"
        />
      </div>
    </div>
    <div class="p-10">
      <Pagination
        class="w-full flex flex-col justify-center items-center gap-10"
        v-slot="{ page }"
        :items-per-page="itemsPerPage"
        :total="chatsIn?.length"
        :default-page="1"
      >
        <div :class="isPhone ? ' mt-4 space-y-2 w-[90vw] ' : ' mt-4 space-y-2 w-[60vw]'">
          <div
            v-if="filteredChats?.length"
            class="w-full flex justify-center items-center gap-8 pb-2"
          >
            <div class="w-[50%] flex justify-center items-center">
              <p class="text-md font-semibold">Name</p>
            </div>
            <div class="w-[50%] flex justify-center items-center">
              <p class="text-md font-semibold">Topic</p>
            </div>
          </div>
          <div v-if="!filteredChats?.length" class="w-full flex justify-center items-center">
            <p class="text-xl font-semibold text-gray-600">There are no chats</p>
          </div>
          <div
            v-for="chat in getPaginatedChats(page)"
            :key="chat.room_id"
            class="bg-black border p-2 rounded-md"
          >
            <div @click="goToChat(chat)">
              <div
                class="w-full text-white flex justify-between items-center gap-4 px-0 min-h-[30px]"
              >
                <div class="w-[20px] h-[20px] px-2">
                  <Icon v-if="!chat.is_group" icon="material-symbols:chat" width="20" height="20" />
                  <Icon v-if="chat.is_group" icon="material-symbols:group" width="20" height="20" />
                </div>

                <div
                  class="flex justify-start items-center gap-4 md:px-[1rem]"
                  :class="!chat.is_group ? 'w-[30%]' : 'w-fit'"
                >
                  <div v-if="!chat.is_group" class="w-[34px] h-[34px] object-cover rounded-full">
                    <img
                      :src="
                        chat?.img === null
                          ? 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                          : chat?.img
                      "
                      alt=""
                      width="34"
                      height="34"
                      class="w-[34px] h-[34px] object-cover rounded-full"
                    />
                  </div>

                  <div v-if="!chat.is_group" class="truncate">
                    {{ chat.name }}
                    <p v-if="chat?.name === null">Anonymous</p>
                  </div>
                </div>
                <div v-if="!chat.is_group" class="w-[10%] flex justify-center items-center">
                  <p>|</p>
                </div>
                <div
                  class="flex justify-start items-center gap-4 md:px-[2rem]"
                  :class="!chat.is_group ? 'w-[40%]' : 'w-full'"
                >
                  <div
                    :class="
                      !chat.is_group
                        ? 'w-full  flex justify-center items-center gap-4'
                        : 'w-full  flex justify-start items-center gap-4'
                    "
                  >
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
  </div>
</template>

<style scoped></style>
