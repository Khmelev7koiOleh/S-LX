<template>
  <div class="bg-[#b6fae8] p-6">
    <div class="flex flex-col justify-center items-center gap-4">
      <div>
        <img src="/public/logo.png" alt="" width="150" height="150" />
      </div>
      <p class="max-w-[55%] font-cursive text-center text-sm font-normal">
        All online classifieds in Ukraine on S'LX - here you will find what you are looking for! By
        clicking on the Post a Classifieds button, you can post an ad on any topic quickly and
        easily. With S'LX, you can buy or sell almost anything from hand to hand.
      </p>
      <div class="flex flex-col justify-center items-center gap-4">
        <p class="text-sm font-light">S'LX communities in social networks:</p>
        <div class="flex gap-4">
          <div v-for="icon in mediaIcons" :key="icon.icon">
            <Icon :icon="icon.icon" :width="icon.width" :height="icon.height" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const mediaIcons = ref([
  {
    icon: 'mdi:facebook',
    width: '34',
    height: '34',
  },
  {
    icon: 'mdi:instagram',
    width: '34',
    height: '34',
  },
  {
    icon: 'mdi:twitter',
    width: '34',
    height: '34',
  },
])
</script>

<style scoped></style>
