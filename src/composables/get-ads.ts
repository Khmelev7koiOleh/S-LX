import { supabase } from '../lib/supabaseClient'
import { onMounted, ref } from 'vue'
import type { AdsType } from '@/types/ads-type'

export function getAllAds() {
  const ads = ref<AdsType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchAds = async () => {
    try {
      loading.value = true

      const { data, error } = await supabase.from('ads').select('*')
      if (!error && data) {
        ads.value = data.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
      }
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }
  onMounted(fetchAds)

  return { ads, loading, error, fetchAds }
}
