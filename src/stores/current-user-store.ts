import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'

export const useGetUserStore = defineStore(
  'user',
  () => {
    const user = ref({
      name: '',
      email: '',
      id: '',
      img: '',
    })

    const signOut = async (router: any) => {
      // signout
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('signout failed:', error.message)
      } else {
        user.value = {
          name: '',
          email: '',
          id: '',
          img: '',
        }
        router.push('/login')
      }
    }

    const signUp = async (name: string, email: string, password: string, router: any) => {
      console.log(email, password)
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            img: 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png',
            name: name,
          },
        },
      })

      if (error) {
        console.error('Login failed:', error.message)
      } else {
        const currentUser = await supabase.auth.getUser()
        console.log(currentUser)

        const { email, id, user_metadata } = currentUser.data.user ?? {}

        user.value = {
          name: user_metadata?.name || '',
          email: email as string,
          id: id as string,
          img: user_metadata?.img || '', // fallback if not set
        }

        console.log('Login success:', data.session)
        router.push('/')
      }
    }
    const signIn = async (email: string, password: string, router: any) => {
      console.log(email, password)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        console.error('Login failed:', error.message)
      } else {
        const currentUser = await supabase.auth.getUser()
        console.log(currentUser)

        if (currentUser.data.user) {
          const { email, id, user_metadata } = currentUser.data.user

          user.value = {
            name: user_metadata?.name || '',
            email: email as string,
            id: id as string,
            img: user_metadata?.img || '', // fallback if not set
          }
        }

        console.log('Login success:', data.session)
        router.push('/')
      }
    }
    return { user, signIn, signUp, signOut }
  },
  { persist: true },
)
