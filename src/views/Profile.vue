<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useGetUserStore } from '@/stores/current-user-store'
import { useWindowSize } from '@/composables/useWindowSize'
const { width, height, isPhone, isTablet, isLaptop } = useWindowSize()
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const router = useRouter()

const usersData = ref<any>([
  { name: 'Ads', path: '/profile/my-profile-ads' },
  { name: 'Chats', path: '/profile/my-profile-chats' },

  { name: 'Profile', path: '/profile/my-profile-profile' },
  { name: 'Ratings', path: '/profile/my-profile-ratings' },
  { name: 'Settings', path: '/profile/my-profile-settings' },
])
const currentProfileTap = ref('Profile')
const getValue = (val: string) => {
  currentProfileTap.value = val
}
// const profileProfileClick = () => {
//   currentProfileTap.value = 'Profile'

// }
onMounted(() => {
  currentProfileTap.value = 'Profile'
  router.push('/profile/my-profile-profile')
})
</script>
<template>
  <div class="bg-gray-300">
    <div class="w-full text-3xl text-gray-800 flex justify-center">
      <div class="px-4 py-2">{{ currentProfileTap }}</div>
    </div>
    <div class="flex flex-col gap-5">
      <div class="w-full flex justify-around bg-gray-300">
        <div v-for="user in usersData" :key="user.name">
          <RouterLink
            :to="`${user.path}`"
            @click="getValue(user.name)"
            active-class="  text-gray-800 text-lg font-semibold  p-2 shadow-sm shadow-gray-400 rounded-md"
          >
            <button>
              {{ user.name }}
            </button>
          </RouterLink>
        </div>
      </div>
      <div class="w-full flex justify-center items-center">
        <div class="w-full">
          <RouterView name="main" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
