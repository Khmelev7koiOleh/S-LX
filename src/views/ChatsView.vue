<script setup lang="ts">
import { useWindowSize } from '@/composables/useWindowSize'
import { RouterLink, RouterView } from 'vue-router'
import { Icon } from '@iconify/vue'
const { isPhone } = useWindowSize()
</script>

<template>
  <div class="w-full flex flex-col justify-center items-center">
    <div
      class="w-full flex justify-start items-center gap-4 pt-8"
      :class="isPhone ? 'px-4' : 'px-20'"
    >
      <Icon icon="mdi:chat" width="40" height="40" class="text-black" />
      <div class="text-3xl font-semibold text-center">My chats and rooms</div>
    </div>
    <div class="w-full flex justify-center items-center gap-12 p-4">
      <!-- if the router is active change bg -->
      <RouterLink
        :to="{ name: 'my-chat-chats' }"
        active-class="  text-gray-800 text-xl font-semibold  p-2 border-b border-gray-400 "
        ><button>My chats</button></RouterLink
      >
      <RouterLink
        :to="{ name: 'my-chat-rooms' }"
        active-class="  text-gray-800 text-xl font-semibold  p-2 border-b border-gray-400 "
        ><button>All rooms</button></RouterLink
      >
    </div>
    <RouterView name="main" />
    <!-- <div>
      <ChatRoomCreate />
    </div>
    <div>
      <ChatsComponent />
    </div> -->
  </div>
</template>

<style scoped></style>
