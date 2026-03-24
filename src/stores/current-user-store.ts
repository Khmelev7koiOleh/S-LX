import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import type { Router } from 'vue-router'

import type { Tables } from '@/types/supabase'

export const useGetUserStore = defineStore(
  'user',
  () => {
    const user = ref<Tables<'user'>>({
      name: '',
      email: '',
      id: '',
      img: '',
      description: '',
      location: '',
      tel: '',
      user_id: '',
      created_at: '',
    })

    const backendError = ref<string[]>([])
    const reset = () => {
      user.value = {
        name: '',
        email: '',
        id: '',
        img: '',
        description: '',
        location: '',
        tel: '',
        user_id: '',
        created_at: '',
      }
    }
    const signOut = async (router: Router) => {
      const { error } = await supabase.auth.signOut()
      if (error) {
        backendError.value = [error.message]
        console.error('signout failed:', error.message)
      } else {
        user.value = {
          name: '',
          email: '',
          id: '',
          img: '',
          description: '',
          location: '',
          tel: '',
          user_id: '',
          created_at: '',
        }
        router.push('/login')
      }
    }

    const signUp = async (name: string, email: string, password: string, router: Router) => {
      const defaultImg = 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png'

      try {
        // 1️⃣ Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              img: defaultImg,
            },
          },
        })

        if (error) {
          console.error('Signup failed:', error.message)
          backendError.value = [error.message]
          return
        }

        if (!data.user) {
          console.error('No user returned from signup')
          backendError.value = ['No user returned from signup']
          return
        }

        const userId = data.user.id

        // 2️⃣ Insert user into your "user" table
        const { error: insertError } = await supabase.from('user').insert({
          id: userId,
          user_id: userId,
          name,
          email,
          img: defaultImg,
          description: '',
          location: '',
          tel: '',
        })

        if (insertError) {
          console.error('Insert into table failed:', insertError.message)
          backendError.value = [insertError.message]
          return
        }

        // 3️⃣ Set your local store (user state)
        user.value = {
          id: userId,
          user_id: userId,
          name,
          email,
          img: defaultImg,
          description: '',
          location: '',
          tel: '',
          created_at: '',
        }

        console.log('Signup success:', data)

        // 4️⃣ Redirect to home (or wherever you want)
        router.push('/')
      } catch (err: any) {
        console.error('Unexpected error during signup:', err)
        backendError.value = [err.message || 'Unknown error']
      }
    }
    const signIn = async (email: string, password: string, router: Router) => {
      console.log(email, password)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        backendError.value = [error.message]
        console.error('Login failed:', error.message)
      } else {
        const currentUser = await supabase.auth.getUser()

        const { data: currentUserQ } = await supabase
          .from('user')
          .select('*')
          .eq('user_id', currentUser.data.user?.id)
        if (currentUserQ) {
          console.log(currentUserQ, 'current user Q')
        }

        if (currentUser.data.user && currentUserQ) {
          const {} = await supabase
            .from('user')
            .update({
              name: currentUserQ[0].name,
              email: currentUserQ[0].email,
              img: currentUserQ[0].img,
              description: currentUserQ[0].description,
              location: currentUserQ[0].location,
              tel: currentUserQ[0].tel,
            })
            .eq('user_id', currentUserQ[0].user_id)

          user.value = {
            name: currentUserQ[0].name || '',
            email: currentUserQ[0].email as string,
            id: currentUserQ[0].user_id as string,
            img: currentUserQ[0].img || '',
            description: currentUserQ[0].description || '',
            location: currentUserQ[0].location || '',
            tel: currentUserQ[0].tel || '',
            user_id: currentUserQ[0].user_id || '',
            created_at: currentUserQ[0].created_at || '',
          }
        }

        console.log('Login success:', data.session)
        router.push('/')
      }
    }
    return { user, signIn, signUp, signOut, backendError, reset }
  },
  { persist: true },
)
