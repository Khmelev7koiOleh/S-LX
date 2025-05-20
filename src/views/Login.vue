<script setup lang="ts">
import { ref } from 'vue'
import { signUp } from '@/composables/sign-up'
import { signIn } from '@/composables/sign-in'
import { useGetUserStore } from '@/stores/current-user-store'
import { useRouter } from 'vue-router'

const userStore = useGetUserStore()
const name = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()
const handleSignUp = () => {
  userStore.signUp(name.value, email.value, password.value, router)
}

const handleSignIn = () => {
  userStore.signIn(email.value, password.value, router)
}
</script>
<template>
  <div class="w-full h-full bg-gray-300 p-20">
    <div
      class="w-[50%] h-[50%] flex flex-col justify-center items-center gap-4 border border-green-900"
    >
      <div>Login</div>
      <div class="flex flex-col gap-4 items-center justify-center">
        <input v-model="name" type="text" placeholder="Name" class="outline" />
        <input v-model="email" type="email" placeholder="Email" class="outline" />
        <input v-model="password" type="password" placeholder="Password" class="outline" />
      </div>
      <div class="flex justify-center items-center gap-4">
        <button @click="handleSignUp" class="px-3 py-1 bg-amber-300 rounded-2xl">Sign Up</button>
        <button @click="handleSignIn" class="px-3 py-1 bg-amber-300 rounded-2xl">Sign In</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
