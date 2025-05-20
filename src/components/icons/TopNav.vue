<template>
  <div class="w-full flex justify-around bg-green-900 p-2">
    <RouterLink :to="{ name: 'home' }" class="flex items-center justify-center gap-3">
      <div class="flex items-center gap-1">
        <p class="text-6xl font-stretch-50% text-white">S</p>

        <p class="text-4xl font-stretch-50% text-white">'LX</p>
      </div>

      <Icon
        icon="mdi:flash"
        width="34"
        height="34"
        class="border border-white rounded-full text-white"
      />
    </RouterLink>
    <div class="flex items-center gap-3">
      <div v-for="item in data" :key="item.url">
        <RouterLink :to="item.path">
          <div class="w-full flex items-center p-2 gap-1 bg-gray-800 text-white rounded-lg">
            <Icon :icon="item.icon" width="24" height="24" />{{ item.title }}
          </div>
        </RouterLink>
      </div>

      <div class="flex px-2 py-1 items-center bg-sky-500 text-white rounded-lg">
        <button @click="handleSignOut()">Sign Out</button>
      </div>

      <div class="flex flex-col items-center justify-center">
        <img :src="user.img" alt="" class="w-10 h-10 rounded-full" />
        <p class="text-white">{{ user.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { defineProps } from 'vue'
import { toRefs } from 'vue'
import { useRouter } from 'vue-router'

import { useGetUserStore } from '@/stores/current-user-store'
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const props = defineProps(['data'])

const { data } = toRefs(props)
const router = useRouter()
const handleSignOut = () => {
  userStore.signOut(router)
}
</script>

<style scoped></style>
