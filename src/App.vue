<script setup lang="ts">
import { toRefs, onMounted, watch } from 'vue'
import { supabase } from './lib/supabaseClient'
import { RouterView } from 'vue-router'
import TopNav from './components/TopNav.vue'
import { navLinks } from '@/data/laptop-navigation'

import { useRouter } from 'vue-router'

import { useGetUserStore } from './stores/current-user-store'
import { useRoute } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'

import 'vue-sonner/style.css' // needed for styling
import { toast } from 'vue-sonner'

const route = useRoute()
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const router = useRouter()

// e.g. in a setup script or method

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    userStore.$reset()
    router.push('/login')
  }
})

watch(
  () => user.value.id,
  (newId, oldId) => {
    if (!oldId && newId) {
      toast(`Hello ${user.value.name}`, {
        description: 'You are logged in successfully',
      })
    }
  },
)
</script>

<template>
  <TopNav v-if="user && user.id && route.path !== '/login'" :data="navLinks" />

  <div :class="user && user.id ? 'pt-[80px]' : 'pt-[0px]'">
    <Toaster />
    <RouterView />
  </div>
</template>
