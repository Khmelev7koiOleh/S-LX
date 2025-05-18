<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'

interface Instrument {
  id: number
  name: string
}

const instruments = ref<Instrument[] | null>([])

async function getInstruments() {
  const { data } = await supabase.from('instruments').select()
  instruments.value = data
}

onMounted(() => {
  getInstruments()
  console.log(instruments)
})
</script>

<template>
  <main>
    <div class="p-40 bg-amber-50">
      <ul>
        <li v-for="instrument in instruments" :key="instrument.id" class="flex gap-3">
          <Icon icon="mdi:home" width="24" height="24" />{{ instrument.name }}
        </li>
      </ul>
    </div>
  </main>
</template>
