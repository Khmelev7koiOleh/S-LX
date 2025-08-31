import { supabase } from '../lib/supabaseClient'

import type { Router } from 'vue-router'

export async function signUp(email: string, password: string, router: Router) {
  console.log(email, password)
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  })

  if (error) {
    console.error('Login failed:', error.message)
  } else {
    const user = await supabase.auth.getUser()
    console.log(user)
    console.log('Login success:', data.session)
    router.push('/')
  }
}
