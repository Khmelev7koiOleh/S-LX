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
      console.log('Signing up:', name, email)

      // 1️⃣ Sign up user with Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            img: 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png',
          },
        },
      })

      if (signUpError) {
        console.error('SignUp failed:', signUpError.message)
        backendError.value = [signUpError.message]
        return
      }

      if (!signUpData.user) {
        console.error('No user returned from signUp')
        backendError.value = ['SignUp did not return a user']
        return
      }

      const userId = signUpData.user.id

      // 2️⃣ Insert profile into users table
      const { data: userData, error: insertError } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          id: userId, // optional if your table has an "id" column
          name,
          email,
          img: 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png',
          description: '',
          location: '',
          tel: '',
        })
        .select()
        .single() // select() + single() ensures we get the inserted row back

      if (insertError) {
        console.error('Insert user failed:', insertError.message)
        backendError.value = [insertError.message]
        return
      }

      // 3️⃣ Get current user (optional, but useful for session info)
      const { data: currentUserData } = await supabase.auth.getUser()

      const { user_metadata, email: userEmail, id } = currentUserData.data.user ?? {}

      // 4️⃣ Update your reactive user object
      user.value = {
        name: user_metadata?.name || userData.name || '',
        email: userEmail || userData.email,
        id: id || userData.user_id,
        img: user_metadata?.img || userData.img || '',
        description: userData.description || '',
        location: userData.location || '',
        tel: userData.tel || '',
        user_id: id || userData.user_id,
        created_at: userData.created_at || '',
      }

      console.log('SignUp & profile creation successful:', user.value)

      // 5️⃣ Redirect
      router.push('/')
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
          const { data, error } = await supabase
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
