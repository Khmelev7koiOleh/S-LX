<script setup lang="ts">
import ChatsComponent from '@/components/ChatsComponent.vue'
import { Icon } from '@iconify/vue'
</script>

<template>
  <div class="w-full flex flex-col justify-center items-center gap-4">
    <div class="w-full flex justify-center items-center">
      <Icon icon="mdi:chat" width="40" height="40" class="text-black" />
      <div class="text-2xl font-semibold text-center p-4">My chats</div>
    </div>
    <ChatsComponent />
  </div>
</template>

<style scoped></style>
