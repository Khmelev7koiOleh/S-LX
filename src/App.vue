<script setup lang="ts">
import { supabase } from './lib/supabaseClient'
import { RouterView } from 'vue-router'
import TopNav from './components/TopNav.vue'
import { navLinks } from '@/data/navigation'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) router.push('/login')
})
</script>

<template>
  <TopNav :data="navLinks" />
  <div><RouterView /></div>
</template>
