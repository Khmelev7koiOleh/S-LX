// composables/getUserComposable.ts
import { supabase } from '../lib/supabaseClient'
import { ref } from 'vue'

import type { UserType } from '@/types/user-type'

export function useGetUserComposable() {
  const users = ref<UserType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUser = async (id: string[]) => {
    console.log(id)
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase.from('user').select('*').in('user_id', id)
      console.log(data)
      if (fetchError) throw fetchError

      users.value = data ?? []
      console.log(users.value)
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    getUser,
  }
}
