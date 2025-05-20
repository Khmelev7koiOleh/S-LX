// composables/upload.ts
import { supabase } from '@/lib/supabaseClient'

export async function uploadImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('ads') // Bucket-Name
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    console.error('Upload failed:', error.message)
    return null
  }

  return data
}

export async function deleteImage(path: string) {
  const { error } = await supabase.storage.from('ads').remove([path])
  if (error) {
    console.error('Delete failed:', error.message)
  } else {
    console.log('Delete success:', path)
  }
}
