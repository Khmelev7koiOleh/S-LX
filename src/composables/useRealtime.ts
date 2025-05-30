// src/composables/useRealtime.js
import { ref, onUnmounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

export function useRealtime() {
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  let subscription = null

  const subscribeToTable = async (tableName, filter = '*') => {
    try {
      loading.value = true

      // Initial data fetch
      const { data: initialData, error: fetchError } = await supabase.from(tableName).select(filter)

      if (fetchError) throw fetchError

      data.value = initialData

      // Set up real-time subscription
      subscription = supabase
        .channel(`realtime-${tableName}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            handleRealtimeUpdate(payload)
          },
        )
        .subscribe((status, err) => {
          if (err) error.value = err
          if (status === 'SUBSCRIBED') {
            loading.value = false
          }
        })
    } catch (err) {
      error.value = err
      loading.value = false
    }
  }

  const handleRealtimeUpdate = (payload) => {
    switch (payload.eventType) {
      case 'INSERT':
        data.value = [...data.value, payload.new]
        break
      case 'UPDATE':
        data.value = data.value.map((item) => (item.id === payload.new.id ? payload.new : item))
        break
      case 'DELETE':
        data.value = data.value.filter((item) => item.id !== payload.old.id)
        break
    }
  }

  const unsubscribe = () => {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }

  // Auto-cleanup
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    data,
    loading,
    error,
    subscribeToTable,
    unsubscribe,
  }
}
