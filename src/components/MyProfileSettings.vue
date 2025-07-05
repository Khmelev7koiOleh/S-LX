<template>
  <div
    :class="
      darkMode
        ? 'bg-white  min-w-[100vw] w-full min-h-[100vh] h-full'
        : 'bg-gray-900  min-w-[100vw] w-full min-h-[100vh] h-full'
    "
  >
    <div class="w-full flex flex-col justify-end items-center p-10 gap-5">
      <div
        :class="
          darkMode
            ? 'text-black text-2xl font-thin w-full flex justify-center items-center'
            : 'text-white text-2xl  font-thin w-full flex justify-center items-center'
        "
      >
        Dark mode
      </div>

      <!-- <button
        @click="darkMode = !darkMode"
        :class="
          darkMode
            ? ' w-12 h-12 flex justify-center items-center bg-black text-white rounded-full'
            : ' w-12 h-12 flex justify-center items-center bg-white text-black rounded-full'
        "
      >
        <Icon icon="mdi:theme-light-dark" width="34" />
      </button> -->
      <div class="w-full flex justify-end items-center">
        <Switch
          class="w-16 h-8 flex justify-center items-center"
          :model-value="darkMode"
          @update:model-value="darkMode = $event"
        >
          <template #thumb>
            <Icon
              v-if="darkMode"
              icon="lucide:moon"
              class="flex justify-center items-center text-gray-100 bg-gray-900 rounded-full size-7"
            />
            <Icon
              v-else
              icon="lucide:sun"
              class="flex justify-center items-center text-black bg-gray-100 rounded-full size-7"
            />
          </template>
        </Switch>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { Switch } from '@/components/ui/switch'
import UserProfile from './user-profile/UserProfile.vue'

let darkMode = ref(false)
</script>

<style scoped></style>
