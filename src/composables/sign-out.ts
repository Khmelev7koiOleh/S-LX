import { supabase } from '../lib/supabaseClient'

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Signs the user out of their session and redirects them to the login page.
 * @param router - The Vue Router instance to use for redirection.
 */
/*******  8a637c2b-8238-49e8-bc1f-748b71190853  *******/ export async function signOut(
  router: any,
) {
  // signout
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('signout failed:', error.message)
  } else {
    router.push('/login')
  }
}
