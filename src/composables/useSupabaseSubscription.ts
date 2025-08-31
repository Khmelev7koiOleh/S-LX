import { ref, onUnmounted } from 'vue'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

export function useSupabaseSubscription() {
  const channel = ref<ReturnType<typeof supabase.channel> | null>(null)
  const subscribe = async <T extends { [key: string]: unknown }>(
    params: {
      event: string
      schema: string
      table: string
      filter: string
    },
    onPayload: (payload: RealtimePostgresChangesPayload<T>) => void,
  ) => {
    channel.value = supabase
      .channel(`${params.table}-channel`)
      .on(
        'postgres_changes' as 'system',
        {
          event: params.event,
          schema: params.schema,
          table: params.table,
          filter: params.filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          onPayload(payload)
        },
      )
      .subscribe()
  }

  const unsubscribe = () => {
    if (channel.value) {
      supabase.removeChannel(channel.value as unknown as RealtimeChannel)
      channel.value = null
    }
  }

  onUnmounted(() => unsubscribe())

  return { subscribe, unsubscribe }
}
