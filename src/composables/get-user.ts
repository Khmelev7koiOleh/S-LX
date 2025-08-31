// composables/getUserComposable.ts
import { supabase } from '../lib/supabaseClient'
import { ref } from 'vue'
import type { Tables } from '@/types/supabase'

export function useGetUserComposable() {
  const user = ref<Tables<'user'>[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUser = async (ids: string[]): Promise<Tables<'user'>[]> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('user') // <--- THIS removes the need to cast
        .select('*')
        .in('user_id', ids)

      if (fetchError) throw fetchError
      user.value = data ?? [] // data is already typed as Tables<'user'>[]

      return user.value
    } catch (err) {
      error.value = (err as Error).message
      user.value = [] // ensure state is consistent
      return []
    } finally {
      loading.value = false
    }
  }

  return { user, loading, error, getUser }
}
