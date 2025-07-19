<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '../stores/current-user-store'
import AdCard from '@/components/AdCard.vue'
import { Icon } from '@iconify/vue'

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const chatsIn = ref<any | null>(null)
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
const favorites = ref<any[] | null>([])
const getFavorites = async () => {
  const { data, error } = await supabase.from('favorites').select('*').eq('user_id', user.value.id)
  if (error) {
    console.log(error)
  }
  favorites.value = data
}

onMounted(() => {
  getFavorites()
  getRoomsCurrentUserIn()
})
</script>

<template>
  <div class="">Favorites</div>

  <div class="w-full flex justify-center" v-if="favorites?.length === 0">
    <div class="w-full flex flex-col justify-center items-center gap-4">
      <p class="text-xl font-light">You have no favorite ads</p>
      <RouterLink :to="{ name: 'about' }">
        <div
          class="flex flex-row items-center gap-2 p-2 shadow-2xl shadow-gray-400 rounded-md bg-gradient-to-r from-gray-500 to-gray-900 text-white"
        >
          <Icon icon="radix-icons:arrow-up" width="20" height="20" />
          <p>See all ads</p>
        </div></RouterLink
      >
    </div>
  </div>

  <div class="w-full grid grid-cols-4 gap-4 p-2">
    <div class="w-full flex flex-col gap-4 p-4 rounded-lg" v-for="i in favorites" :key="i.id">
      <RouterLink :to="`/ad/${i.ad_id}`">
        <AdCard
          :title="i.title"
          :description="i.description"
          :price="i.price"
          :id="i.id"
          :img="i.img[0]"
          :type="i.type"
          :size="'300px'"
          :h_size="'250px'"
          :w_container="'300px'"
          :h_container="'350px'"
          :horisontal="true"
          :col="true"
          :created_at="i.created_at"
          :if_favorite="true"
          :user_name="i.user_name"
        />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped></style>
