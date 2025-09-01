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
import { useMenuOpenStore } from '@/stores/menu-open-store'
const menuOpenStore = useMenuOpenStore()
const { onMenuOpen } = toRefs(menuOpenStore)
const { isPhone } = useWindowSize()
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const props = defineProps(['data'])

const { data } = toRefs(props)
const router = useRouter()
const isHovered = ref<string | null | boolean>(null)
// add store for onMenuOpen

const handleSignOut = () => {
  userStore.signOut(router)
  onMenuOpen.value = false
}
const burgerMenuComputed = computed(() => {
  if (!isPhone.value) {
    return 'flex flex-row items-center gap-3'
  } else if (isPhone.value && onMenuOpen.value) {
    return 'w-[100vw] h-[100vh] fixed  flex flex-col justify-start items-center gap-10 bg-gray-50 z-20 py-[70%] '
  } else if (isPhone.value && !onMenuOpen.value) {
    return 'hidden'
  } else return ''
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
  <!-- add numbers to the favorite and chats (how many chats and favorited ads are there) -->
  <div class="w-full h-[70px] flex justify-around bg-gray-900">
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
          class="text-black"
        />
      </div>
      <div
        v-for="item in data"
        :key="item.url"
        class="w-full flex flex-col justify-center items-center"
        @mouseenter="isHovered = item.title"
        @mouseleave="isHovered = null"
      >
        <RouterLink
          @click="onMenuOpen = false"
          :to="item.path"
          :class="isPhone ? 'w-[100px] bg-transparent' : 'w-full'"
          class="flex flex-col justify-center items-center"
        >
          <Button
            class="w-full flex items-center justify-start p-2 gap-1 text-white rounded-lg hover:shadow-sm hover:shadow-white"
            :class="
              isPhone
                ? 'w-[100px] flex justify-start items-center bg-transparent border-b border-b-gray-300 rounded-none'
                : 'w-[100px] flex justify-center items-center bg-transparent border-b borrder-b-gray-300 rounded-none'
            "
          >
            <Icon
              :icon="isHovered === item.title ? item.icon_hover : item.icon"
              width="24"
              height="24"
              :class="isPhone ? 'text-black' : 'text-white'"
            />
            <p :class="isPhone ? 'text-gray-900' : 'text-white'">{{ item.title }}</p>
          </Button>
        </RouterLink>
      </div>

      <div :class="isPhone && onMenuOpen ? '' : 'w-full relative'">
        <DropdownMenu>
          <DropdownMenuTrigger
            ><Button
              @mouseenter="isHovered = true"
              @mouseleave="isHovered = false"
              :class="
                isPhone
                  ? 'w-[100px] flex justify-start items-center bg-transparent border-b border-b-gray-300 rounded-none'
                  : 'w-full bg-transparent border-b borrder-b-gray-300 rounded-none'
              "
              class="hover:shadow-sm hover:shadow-white"
              ><Icon
                :icon="isHovered === true ? 'mdi:account' : 'mdi:account-outline'"
                width="24"
                height="24"
                :class="isPhone ? 'text-black' : 'text-white'"
              />
              <p :class="isPhone ? 'text-gray-900' : 'text-white'">Profile</p></Button
            ></DropdownMenuTrigger
          >
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <RouterLink
                @click="onMenuOpen = false"
                :to="{ name: 'profile' }"
                class="flex items-center justify-start gap-2"
              >
                <Avatar>
                  <AvatarImage :src="user.img ?? ''" alt="@unovue" />
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
