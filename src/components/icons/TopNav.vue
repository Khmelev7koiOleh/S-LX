<template>
  <div class="w-full flex justify-around">
    <div class="flex items-center justify-center gap-3">
      <p class="text-4xl font-stretch-50%">S'LX</p>
      <Icon icon="mdi:flash" width="34" height="34" class="border border-black rounded-full" />
    </div>
    <div v-for="item in data" :key="item.url">
      <RouterLink :to="item.path">
        <div class="w-full flex p-2 bg-gray-800 text-white">{{ item.title }}</div>
      </RouterLink>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { defineProps } from 'vue'
import { toRefs } from 'vue'

const props = defineProps(['data'])

const { data } = toRefs(props)
</script>

<style scoped></style>
