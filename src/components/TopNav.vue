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

const handleSignOut = () => {
  userStore.signOut(router)
  onMenuOpen.value = false
}
const burgerMenuComputed = computed(() => {
  if (!isPhone.value) {
    return 'flex flex-row items-center gap-3'
  } else if (isPhone.value && onMenuOpen.value) {
    return 'w-[100vw] h-[100vh] fixed  flex flex-col justify-start items-center gap-12 bg-gray-50 z-20 py-[30%] '
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
  <div
    class="w-[100vw] fixed top-0 left-0 flex justify-around bg-gray-50 z-50"
    :class="isPhone ? 'h-[70px]' : 'h-[80px]'"
  >
    <RouterLink :to="{ name: 'home' }" class="flex items-center justify-center gap-3">
      <img src="/public/logo.png" alt="" width="130" height="130" class="w-[130px] h-[130px]" />
    </RouterLink>

    <div v-if="isPhone" class="absolute top-4 right-4">
      <Icon
        @click="onMenuOpen = !onMenuOpen"
        icon="mdi:menu"
        width="30"
        height="30"
        class="text-black"
      />
    </div>

    <div :class="burgerMenuComputed" class="">
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
      <RouterLink :to="{ name: 'home' }" class="w-full flex items-center justify-center gap-0">
        <img src="/public/logo.png" alt="" width="130" height="130" class="w-[130px] h-[130px]" />
      </RouterLink>
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
          :class="isPhone ? 'w-[200px] bg-transparent' : 'w-full'"
          class="flex flex-col justify-center items-center"
        >
          <Button
            class="w-full flex items-center justify-start p-2 gap-1 rounded-lg hover:shadow-sm hover:shadow-white"
            :class="
              isPhone
                ? 'w-[200px] flex justify-start items-center bg-transparent border-b border-b-gray-300 rounded-none hover:bg-white  hover:scale-110'
                : 'w-[100px] flex justify-start items-center bg-transparent border-b border-b-gray-300 rounded-none hover:bg-white hover:scale-110'
            "
          >
            <Icon
              :icon="isHovered === item.title ? item.icon_hover : item.icon"
              width="24"
              height="24"
              :class="isPhone ? 'text-black' : 'text-black'"
            />
            <p :class="isPhone ? 'text-gray-900' : 'text-black '">{{ item.title }}</p>
          </Button>
        </RouterLink>
      </div>

      <div
        :class="
          isPhone && onMenuOpen ? 'w-full flex justify-center items-center' : 'w-full relative'
        "
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            ><Button
              @mouseenter="isHovered = true"
              @mouseleave="isHovered = false"
              :class="
                isPhone
                  ? isHovered
                    ? 'w-[200px] flex justify-start items-center bg-transparent border-b border-b-gray-300 rounded-none hover:bg-white  hover:scale-110'
                    : 'w-[200px] flex justify-start items-center bg-transparent border-b border-b-gray-300 rounded-none hover:bg-white  hover:scale-110'
                  : isHovered
                    ? 'w-full bg-transparent border-b borrder-b-gray-300 rounded-none hover:bg-white  hover:scale-110'
                    : 'w-full bg-transparent border-b borrder-b-gray-300 rounded-none hover:bg-white  hover:scale-110'
              "
              class="hover:shadow-sm hover:shadow-white"
              ><Icon
                :icon="isHovered === true ? 'mdi:account' : 'mdi:account-outline'"
                width="24"
                height="24"
                :class="isPhone ? 'text-black' : 'text-black'"
              />
              <p :class="isPhone ? 'text-gray-900' : 'text-black'">Profile</p></Button
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
