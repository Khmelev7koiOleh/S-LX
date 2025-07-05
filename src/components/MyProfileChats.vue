<script setup lang="ts">
import ChatsComponent from './ChatsComponent.vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { ref, toRefs, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '../stores/current-user-store'
import ChatMessageComponent from '@/components/ChatMessageComponent.vue'
import { Icon } from '@iconify/vue'

const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const messages = ref<any | null>(null)

const chatsIn = ref<any | null>([])
const getRoomsCurrentUserIn = async () => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .contains('participant_ids', [user.value.id])
  if (error) {
    console.error('Error fetching chat rooms:', error)
    return
  }
  console.log(data)
  chatsIn.value = data
  return data
}

// const getChatsValue = async (val: any) => {
//   console.log(val)
//   const { data, error } = await supabase.from('messages').select('*').eq('room_id', val)
//   console.log(data)
//   messages.value = data
//   return data
// }

onMounted(() => {
  getRoomsCurrentUserIn()
})

const itemsPerPage = 4

const getPaginatedChats = (page) => {
  const start = (page - 1) * itemsPerPage
  return chatsIn.value.slice(start, start + itemsPerPage)
}
</script>

<template>
  <div class="w-full flex flex-col mx-auto px-4">
    <div class="w-full flex flex-col gap-4 justify-center items-center p-4">
      <p class="text-sm font-light underline">Chats that you have</p>
    </div>

    <!-- <div><ChatsComponent /></div> -->
  </div>

  <div class="p-10">
    <Pagination
      class="w-full flex flex-col justify-center items-center gap-10"
      v-slot="{ page }"
      :items-per-page="itemsPerPage"
      :total="chatsIn.length"
      :default-page="1"
    >
      <div class="mt-4 space-y-2 w-[60vw]">
        <div
          v-for="chat in getPaginatedChats(page)"
          :key="chat.id"
          class="bg-black border p-2 rounded-md"
        >
          <RouterLink :to="'/chats/' + chat.room_id">
            <div class="text-white flex gap-4 px-4">
              <Icon icon="material-symbols:chat" width="24" />
              <div>{{ chat.room_topic }}</div>
              /
            </div>
            <!-- or any chat field -->
          </RouterLink>
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

      <!-- This is where you display paginated chats -->
    </Pagination>
  </div>
</template>

<style scoped></style>
