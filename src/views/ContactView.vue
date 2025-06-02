<template>
  <div>contact</div>

  <!-- <div class="w-full flex flex-col p-2" v-for="chat in chatsIn" :key="chat.id">
    <div class="w-full flex flex-col gap-4 bg-green-400">
      {{ chat.room_id }}
    </div>
  </div> -->
</template>

<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
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

onMounted(() => {
  getRoomsCurrentUserIn()
})
</script>

<style scoped></style>
