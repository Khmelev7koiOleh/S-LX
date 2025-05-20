import { supabase } from '../lib/supabaseClient'

export async function signIn(email: string, password: string, router: any) {
  console.log(email, password)
  const { data, error } = await supabase.auth.signInWithPassword({
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
