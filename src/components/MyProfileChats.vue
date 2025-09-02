<script setup lang="ts">
import ChatsComponent from './ChatsComponent.vue'
</script>

<template>
  <div class="w-full flex flex-col mx-auto px-4">
    <div class="w-full flex flex-col gap-4 justify-center items-center p-4">
      <p class="text-sm font-light underline">Chats that you have</p>
    </div>
    <ChatsComponent />
  </div>
</template>

<style scoped></style>
