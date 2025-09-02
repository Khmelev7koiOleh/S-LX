<script setup lang="ts">
import ChatsComponent from '@/components/ChatsComponent.vue'
import { useWindowSize } from '@/composables/useWindowSize'

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
      <div class="text-3xl font-semibold text-center">My chats</div>
    </div>
    <ChatsComponent />
  </div>
</template>

<style scoped></style>
