import { supabase } from '../lib/supabaseClient'
import type { Router } from 'vue-router'

export async function signOut(router: Router) {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('signout failed:', error.message)
  } else {
    router.push('/login')
  }
}
