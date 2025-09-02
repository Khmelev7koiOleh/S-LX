import { supabase } from '../lib/supabaseClient'
import { ref, onUnmounted, onMounted } from 'vue'
import { useSupabaseSubscription } from '@/composables/useSupabaseSubscription'
import { useGetAverageRating } from '@/composables/get-average-rating'
import { useRatingsStore } from '../stores/rating-store'
const { subscribe, unsubscribe } = useSupabaseSubscription()
const { getAverageRating } = useGetAverageRating()

export function useRateUser() {
  const error = ref<string | null>(null)

  const storeRating = useRatingsStore()
  const k = storeRating.id as string
  const rateUser = async (targetUserId: string, userId: string, rating: number) => {
    console.log(targetUserId)
    console.log('rateUser', targetUserId, 'by', userId, 'with rating', rating)

    const { data: dataGet, error: getError } = await supabase
      .from('ratings')
      .select('*')
      .eq('target_user_id', targetUserId)
      .eq('rated_by', userId)

    if (getError) {
      console.error('Failed to check existing rating:', getError)
      return
    }

    if (dataGet && dataGet.length > 0) {
      const { error: updateError } = await supabase
        .from('ratings')
        .update({ rating })
        .eq('target_user_id', targetUserId)
        .eq('rated_by', userId)

      if (updateError) {
        console.error('Rating update error:', updateError)
      } else {
        console.log('Rating updated successfully')
        await getAverageRating(k)
      }
    } else {
      const { error: insertError } = await supabase.from('ratings').insert([
        {
          target_user_id: targetUserId,
          rated_by: userId,
          rating,
        },
      ])

      if (insertError) {
        console.error('Rating insert error:', insertError)
      } else {
        console.log('Rating inserted successfully')
        await getAverageRating(k)
      }
    }
  }

  onMounted(() => {
    console.log(k)
    subscribe(
      {
        event: '*',
        schema: 'public',
        table: 'ratings',
        filter: `target_user_id=eq.${k}`,
      },
      async (payload) => {
        console.log('Realtime change detected:', payload)
        console.log(k)
        await getAverageRating(k)
      },
    )
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return {
    error,
    rateUser,
  }
}
