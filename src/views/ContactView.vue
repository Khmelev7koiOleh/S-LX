<template>
  <div>contact</div>

  <div class="w-full flex flex-col gap-4 p-2">
    <div
      class="w-full flex flex-col gap-4 bg-green-900 text-white p-4 rounded-lg"
      v-for="i in favorites"
      :key="i.id"
    >
      <RouterLink :to="`/ad/${i.ad_id}`">
        <img :src="i.img" alt="" width="50" height="50" />
        {{ i.user_id }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '../stores/current-user-store'

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

<style scoped></style>
