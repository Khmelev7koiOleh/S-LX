<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { defineProps } from 'vue'
import { ref, toRefs } from 'vue'
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
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const props = defineProps(['data'])

const { data } = toRefs(props)
const router = useRouter()
// const onPanelOpen = ref<boolean>(false)
const handleSignOut = () => {
  userStore.signOut(router)
}
</script>

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
          <Button class="w-full flex items-center p-2 gap-1 text-white rounded-lg">
            <Icon :icon="item.icon" width="24" height="24" />{{ item.title }}
          </Button>
        </RouterLink>
      </div>

      <div class="w-full relative">
        <!-- <div>
            <Button class="flex gap-4" @click="onPanelOpen = !onPanelOpen">
              <Icon icon="mdi:account" width="24" height="24" class="text-white" />
              <div class="flex items-center">
                <div class="text-white">Your Profile</div>
                <Icon
                  icon="mdi:chevron-down"
                  :class="[
                    'text-white transition-transform duration-200',
                    onPanelOpen ? 'rotate-x-180' : 'rotate-0',
                  ]"
                  width="24"
                  height="24"
                />
              </div>
            </Button>
          </div> -->

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
