<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { defineProps } from 'vue'
import { ref, toRefs, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from './ui/button'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useGetUserStore } from '@/stores/current-user-store'

import { useWindowSize } from '@/composables/useWindowSize'

const { width, height, isPhone, isTablet, isLaptop } = useWindowSize()
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const props = defineProps(['data'])

const { data } = toRefs(props)
const router = useRouter()

// add store for onMenuOpen
// add store for onMenuOpen
// add store for onMenuOpen
// add store for onMenuOpen
// add store for onMenuOpen
// add store for onMenuOpen
// add store for onMenuOpen
// add store for onMenuOpen
const onMenuOpen = ref<boolean>(false)
const handleSignOut = () => {
  userStore.signOut(router)
}
const burgerMenuComputed = computed(() => {
  if (!isPhone.value) {
    return 'flex flex-row items-center gap-3'
  } else if (isPhone.value && onMenuOpen.value) {
    return 'w-[100vw] h-[100vh] fixed  flex flex-col justify-start items-center gap-3 bg-gray-900 z-10 py-[20%]'
  } else if (isPhone.value && !onMenuOpen.value) {
    return 'hidden'
  }
})
watch(onMenuOpen, (val) => {
  if (val) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
})
</script>

<template>
  <div class="w-full flex justify-around bg-[#07242f]">
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

    <div v-if="isPhone" class="absolute top-4 right-4">
      <!-- burger menu -->
      <Icon
        @click="onMenuOpen = !onMenuOpen"
        icon="mdi:menu"
        width="30"
        height="30"
        class="text-white"
      />
    </div>
    <div :class="burgerMenuComputed">
      <div class="absolute top-6 left-6">
        <!-- burger menu -->
        <Icon
          v-if="isPhone && onMenuOpen"
          @click="onMenuOpen = !onMenuOpen"
          icon="mdi:arrow-left"
          width="30"
          height="30"
          class="text-white"
        />
      </div>
      <div v-for="item in data" :key="item.url">
        <RouterLink @click="onMenuOpen = false" :to="item.path">
          <Button class="w-full flex items-center p-2 gap-1 text-white rounded-lg">
            <Icon :icon="item.icon" width="24" height="24" />{{ item.title }}
          </Button>
        </RouterLink>
      </div>

      <div
        :class="
          isPhone && onMenuOpen
            ? 'w-full relative flex justify-center items-center'
            : 'w-full relative'
        "
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            ><Button
              ><Icon icon="mdi:account" width="24" height="24" class="text-white" /> Profile</Button
            ></DropdownMenuTrigger
          >
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <RouterLink :to="{ name: 'profile' }" class="flex items-center justify-start gap-2">
                <Avatar>
                  <AvatarImage :src="user.img" alt="@unovue" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <p class="text-black">{{ user.name }}</p>
              </RouterLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div class="w-full flex justify-center items-center">
                <Button @click="handleSignOut()">
                  <Icon icon="mdi:sign-out" width="24" height="24" class="text-white" /> Sign
                  Out</Button
                >
              </div></DropdownMenuItem
            >
            <!-- <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem> -->
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
