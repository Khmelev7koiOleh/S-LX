<template>
  <div class="bg-[#05392c] mt-2">
    <div class="flex justify-center items-center gap-4">
      <div>
        <img
          src="https://www.olx.ua/app/static/media/graph.49012f6ae.svg"
          alt=""
          width="150"
          height="150"
        />
      </div>
      <div class="flex justify-between items-center gap-4 mx-4">
        <p class="max-w-[55%] font-cursive text-start text-white text-sm font-normal">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio est ipsam et esse quos
        </p>
        <button class="text-md text-black bg-white px-3 py-1.5 rounded-md">More Details</button>
      </div>
      <!-- <div class="flex flex-col justify-center items-center gap-4">
        <p class="text-sm font-light">S'LX communities in social networks:</p> -->
      <!-- <div class="flex gap-4">
          <div v-for="icon in mediaIcons" :key="icon.icon">
            <Icon :icon="icon.icon" :width="icon.width" :height="icon.height" />
          </div>
        </div> -->
      <!-- </div> -->
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
