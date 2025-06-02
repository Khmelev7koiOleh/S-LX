<template>
  <div>contact</div>

  <!-- <div class="w-full border-b border-b-gray-800">
    {{ chatsIn }}
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
    .select('room_id')
    .contains('participant_ids', [user.value.id])
  if (error) {
    console.error('Error fetching chat rooms:', error)
    return
  }
  chatsIn.value = data
  return data
}

onMounted(() => {
  getRoomsCurrentUserIn()
})
</script>

<style scoped></style>
