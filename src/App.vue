<script setup lang="ts">
import { toRefs, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'
import { RouterView } from 'vue-router'
import TopNav from './components/TopNav.vue'
import { navLinks } from '@/data/laptop-navigation'

import { useRouter } from 'vue-router'

import { useGetUserStore } from './stores/current-user-store'
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const router = useRouter()

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    router.push('/login')
  }
})
</script>

<template>
  <TopNav v-if="user.id" :data="navLinks" />
  <div><RouterView /></div>
</template>
