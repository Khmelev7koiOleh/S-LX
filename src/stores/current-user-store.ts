import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import type { Router } from 'vue-router'
// import type { UserType } from '@/types/user-type'
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

    const signOut = async (router: Router) => {
      // signout
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

      const {} = await supabase.from('user').insert({
        id: data.user?.id,
        name: name,
        email: email,
        img: 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png',
        user_id: data.user?.id,
        description: '',
        location: '',
        tel: '',
      })

      if (error) {
        backendError.value = [error.message]
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
          description: '',
          location: '',
          tel: '',
          user_id: id as string,
          created_at: '',
        }

        console.log('Login success:', data.session)
        router.push('/')
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
        // console.log(currentUser.data.user?.id)
        const { data: currentUserQ } = await supabase
          .from('user')
          .select('*')
          .eq('user_id', currentUser.data.user?.id)
        if (currentUserQ) {
          console.log(currentUserQ, 'current user Q')
        }

        if (currentUser.data.user && currentUserQ) {
          // const { email, id, user_metadata } = currentUser.data.user

          // console.log(email, name, id)

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
            .eq('user_id', currentUserQ[0].user_id) // This is your WHERE condition

          user.value = {
            name: currentUserQ[0].name || '',
            email: currentUserQ[0].email as string,
            id: currentUserQ[0].user_id as string,
            img: currentUserQ[0].img || '', // fallback if not set
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
    return { user, signIn, signUp, signOut, backendError }
  },
  { persist: true },
)
