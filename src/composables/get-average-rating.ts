import { supabase } from '../lib/supabaseClient'
import { ref } from 'vue'
import { useRatingsStore } from '../stores/rating-store'

export function useGetAverageRating() {
  const error = ref<string | null>(null)

  const getAverageRating = async (targetUserId: string | number) => {
    const ratingStore = useRatingsStore()

    console.log('getAverageRating', targetUserId)

    const { data, error: fetchError } = await supabase
      .from('ratings')
      .select('*')
      .eq('target_user_id', targetUserId)

    if (fetchError) {
      console.error(fetchError)
      error.value = fetchError.message
      return
    }

    if (data && data.length > 0) {
      ratingStore.rating = data.reduce((acc, rating) => acc + rating.rating, 0)
      console.log(ratingStore.rating)
    } else {
      ratingStore.rating = 0
    }
  }

  return {
    error,
    getAverageRating,
  }
}
