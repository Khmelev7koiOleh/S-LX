// composables/getUserComposable.ts
import { supabase } from '../lib/supabaseClient'
import { ref } from 'vue'
import type { Tables } from '@/types/supabase'
// import type { UserType } from '@/types/user-type'

export function useGetUsersComposable() {
  const users = ref<Tables<'user'>[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUsers = async (id: string[]): Promise<Tables<'user'>[]> => {
    console.log(id)
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase.from('user').select('*').in('user_id', id)
      console.log(data)
      if (fetchError) throw fetchError

      users.value = (data as Tables<'user'>[]) ?? []
      console.log(users.value)
      return users.value
    } catch (err) {
      error.value = (err as Error).message
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    getUsers,
  }
}
