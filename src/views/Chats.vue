<template>
  <div class="text-2xl text-center">Chats</div>

  <div>
    <button @click="sendMessage">send</button>
  </div>
  <div class="w-full flex flex-wrap gap-4 p-8">
    <div v-for="chat in chats" :key="chat.id">
      <div>{{ chat.message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const chats = ref<any[]>([])
const realtimeSub = ref<any>(null)
const getChats = async () => {
  const { data } = await supabase.from('chats').select('*').order('created_at', { ascending: true })
  if (data) chats.value = data
}

const sendMessage = async () => {
  const { error } = await supabase.from('chats').insert({
    message: 'hello from Vue!',
  })
  if (error) console.error(error)
}

// let realtimeSub: any

onMounted(async () => {
  await getChats()
})
onMounted(() => {
  realtimeSub.value = supabase
    .channel('chats')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload) => {
      console.log(payload)
      chats.value.push(payload.new)
    })
    .subscribe()
})

onUnmounted(() => {
  realtimeSub.value.unsubscribe()
  console.log('unsubscribed')
})
</script>

<style scoped></style>
