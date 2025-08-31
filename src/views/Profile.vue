<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
// import { useGetUserStore } from '@/stores/current-user-store'
// import { useWindowSize } from '@/composables/useWindowSize'
// const { width, height, isPhone, isTablet, isLaptop } = useWindowSize()
// const userStore = useGetUserStore()
// const { user } = toRefs(userStore)
interface usersDataType {
  name: string
  path: string
}
const router = useRouter()

const usersData = ref<usersDataType[]>([
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
  <div class="bg-gray-100">
    <div class="w-full text-gray-800 flex justify-center">
      <div class="w-full flex justify-center px-4 py-4">
        <!-- <p class="text-gray-800 text-xl font-mono">{{ currentProfileTap }}</p> -->
      </div>
    </div>
    <div class="w-full flex flex-col justify-center items-center gap-5 px-0">
      <div class="w-fit flex justify-center items-center gap-6 md:gap-20 p-4">
        <div v-for="user in usersData" :key="user.name">
          <RouterLink
            :to="`${user.path}`"
            @click="getValue(user.name)"
            active-class="  text-gray-800 text-lg font-semibold  p-2 shadow-sm shadow-gray-400 rounded-md"
          >
            <button class="min-w-[70px]">
              {{ user.name }}
            </button>
          </RouterLink>
        </div>
      </div>
      <div class="w-full flex justify-center items-center py-4">
        <div class="w-full h-full min-h-[90vh]">
          <RouterView name="main" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
