<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { useGetUserStore } from '@/stores/current-user-store'
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
</script>
<template>
  <!-- <div class="text-2xl p-4">my Profile profile</div> -->

  <div class="w-full bg-gray-300">
    <div class="w-[60%] mx-auto">
      <div class="w-full flex flex-col justify-center items-start gap-4 m-10 p-10">
        <div class="flex justify-start items-center gap-6">
          <div>
            <img :src="user.img" class="rounded-full" width="150" height="150" alt="" />
          </div>
          <div class="flex flex-col justify-center items-start gap-2">
            <div class="text-xl text-gray-800 font-mono">{{ user.name }}</div>
            <div class="text-md text-gray-800 font-mono">{{ user.email }}</div>
          </div>
        </div>
        <div class="px-4 py-2 text-md text-gray-800 rounded-lg font-mono">{{ user.id }}</div>
      </div>
    </div>

    <!-- another section -->
    <div class="w-[70%] mx-auto bg-gray-100 p-4">
      <div class="text-center">Main info</div>
      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <button
            class="px-4 py-2 border-b-2 border-gray-900 text-gray-800 text-md font-bold shadow"
          >
            Add main information
          </button>
          <button
            class="px-4 py-2 border-b-2 border-gray-900 text-gray-800 text-md font-bold shadow"
          >
            Edit
          </button>
        </div>
        <div class="px-4 py-2 border border-gray-900">
          <input type="text" placeholder="Change some info" />
        </div>
      </div>
    </div>

    <div class="w-[70%] mx-auto bg-gray-100 p-4">
      <div class="text-center">Something else</div>

      <br />
      <div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur saepe perferendis
      </div>
      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <button
            class="px-4 py-2 border-b-2 border-gray-900 text-gray-800 text-md font-bold shadow"
          >
            Add something else
          </button>
        </div>
        <div class="px-4 py-2 border border-gray-900">
          <input type="text" placeholder="Change some info" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
