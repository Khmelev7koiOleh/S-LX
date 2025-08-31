<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '../stores/current-user-store'
import AdCard from '@/components/AdCard.vue'
import { Icon } from '@iconify/vue'
import type { Tables } from '@/types/supabase'

import { useWindowSize } from '@/composables/useWindowSize'

const { isPhone } = useWindowSize()

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const chatsIn = ref<Tables<'chats'>[]>([])
const getRoomsCurrentUserIn = async () => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .contains('participant_ids', [user.value.id])
  if (error) {
    console.error('Error fetching chat rooms:', error)
    return
  }
  console.log(data)
  chatsIn.value = data
  return data
}
const favorites = ref<Tables<'favorites'>[]>([])
const getFavorites = async () => {
  const { data, error } = await supabase.from('favorites').select('*').eq('user_id', user.value.id)
  if (error) {
    console.log(error)
  }
  favorites.value = data ?? []
}

onMounted(() => {
  getFavorites()
  getRoomsCurrentUserIn()

  supabase
    .channel(`favorites:user:${user.value.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'favorites',
        filter: `user_id=eq.${user.value.id}`,
      },
      () => {
        getFavorites()
      },
    )
    .subscribe()
})
</script>

<template>
  <div class="text-2xl font-semibold p-4 pb-8 text-center">Favorites</div>

  <div class="w-full flex justify-center" v-if="favorites?.length === 0">
    <div class="w-full flex flex-col justify-center items-center gap-4">
      <p class="text-xl font-light">You have no favorite ads</p>
      <RouterLink :to="{ name: 'ads' }">
        <div
          class="flex flex-row items-center gap-2 p-2 shadow-2xl shadow-gray-400 rounded-md bg-gradient-to-r from-gray-500 to-gray-900 text-white"
        >
          <Icon icon="radix-icons:arrow-up" width="20" height="20" />
          <p>See all ads</p>
        </div></RouterLink
      >
    </div>
  </div>

  <div
    :class="
      isPhone
        ? ' w-full grid grid-cols-2 justify-center items-center gap-4  '
        : ' w-full grid grid-cols-4 p-[2rem] justify-center items-center'
    "
  >
    <div
      class="w-full flex flex-col items-center justify-center rounded-lg"
      v-for="f in favorites"
      :key="f.id"
    >
      <!-- <img :src="f.img" alt="" /> -->
      <RouterLink :to="`/ad/${f.id}`">
        <AdCard
          :title="f.title"
          :description="f.description"
          :price="f.price"
          :id="f.id"
          :img="[f.img?.[0] || '']"
          :type="null"
          :h_size="isPhone ? '120px' : '200px'"
          :size="isPhone ? '180px' : '300px'"
          :w_container="isPhone ? '180px' : '300px'"
          :h_container="isPhone ? '250px' : '350px'"
          :horisontal="true"
          :col="true"
          :created_at="f.created_at"
          :if_favorite="true"
          :if_discount="f.if_discount"
          :discount="f.discount"
        />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped></style>
