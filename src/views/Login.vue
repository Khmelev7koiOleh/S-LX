<script setup lang="ts">
import { onMounted, ref, toRefs } from 'vue'
import { signUp } from '@/composables/sign-up'
import { signIn } from '@/composables/sign-in'
import { useGetUserStore } from '@/stores/current-user-store'
import { useRouter } from 'vue-router'

import Button from '@/components/ui/button/Button.vue'

const userStore = useGetUserStore()
const { backendError } = toRefs(userStore)
const name = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()
const isSignUp = ref(true)
const isSignIn = ref(false)
const signValue = ref('SignUp')
const handleSignUp = () => {
  userStore.signUp(name.value, email.value, password.value, router)
}

const handleSignIn = () => {
  userStore.signIn(email.value, password.value, router)
}
const handleSignSwitch = (val: string) => {
  backendError.value = []
  if (val === 'sign-up') {
    isSignUp.value = true
    isSignIn.value = false
  }
  if (val === 'sign-in') {
    isSignIn.value = true
    isSignUp.value = false
  }
  signValue.value = isSignUp.value ? 'SignUp' : 'SignIn'
}
const handleLogin = () => {
  if (isSignUp.value === true) {
    handleSignUp()
  } else {
    handleSignIn()
  }
}
onMounted(() => {
  backendError.value = []
})
</script>
<template>
  <div class="w-[100vw] h-[100vh] flex justify-center items-center bg-gray-100">
    <div
      class="w-[400px] h-[500px] flex flex-col justify-center items-center gap-4 shadow-inner rounded-xl relative bg-white"
    >
      <div class="w-full flex flex-col justify-center items-center gap-2 p-4 absolute top-2">
        <div class="text-2xl m-4 text-gray-800 font-extralight">{{ signValue }}</div>
        <div class="w-full flex justify-center items-center gap-4">
          <button
            @click="handleSignSwitch('sign-up')"
            :class="
              isSignUp
                ? ' px-4 py-2 font-semibold rounded-sm text-gray-500 bg-gray-900   shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.6)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.4)] transition-all duration-150 ease-in-out select-none'
                : ' px-4 py-2 font-semibold rounded-sm text-gray-400 bg-white shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.6)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.4)] transition-all duration-150 ease-in-out select-none'
            "
          >
            Sign up
          </button>

          <button
            @click="handleSignSwitch('sign-in')"
            :class="
              isSignIn
                ? ' px-4 py-2 font-semibold rounded-sm text-gray-500 bg-gray-900   shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.6)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.4)] transition-all duration-150 ease-in-out select-none'
                : ' px-4 py-2 font-semibold rounded-sm text-gray-400 bg-white shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.6)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.4)] transition-all duration-150 ease-in-out select-none'
            "
          >
            Sign in
          </button>
        </div>
      </div>

      <div class="w-full h-full flex flex-col justify-center items-center gap-4 shadow rounded-xl">
        <div class="w-[70%] flex flex-col gap-6 items-center justify-center absolute bottom-1/3">
          <div class="text-red-400 text-xl" v-if="backendError.length">{{ backendError }}</div>
          <input
            v-if="isSignUp"
            v-model="name"
            type="text"
            placeholder="Name"
            class="shadow px-2 w-full"
          />
          <input v-model="email" type="email" placeholder="Email" class="shadow px-2 w-full" />
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="shadow px-2 w-full"
          />
        </div>
        <div class="w-[70%] flex justify-center items-center absolute bottom-1/10 -translate-y-1/2">
          <Button @click="handleLogin()" class="w-full px-3 py-1 bg-gray-800 rounded-md">
            {{ signValue }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
