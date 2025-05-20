<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'
import Search from '@/components/icons/Search.vue'
import AddAnAd from '@/components/icons/AddAnAd.vue'
import { adType } from '@/data/ad-type'
import { useClickFunctionStore } from '@/stores/click-function-store'
import UploadAd from '@/components/UploadAd.vue'

interface Instrument {
  id: number
  name: string
}
const clickStore = useClickFunctionStore() // Access the store
const instruments = ref<Instrument[] | null>([])

async function getInstruments() {
  const { data } = await supabase.from('instruments').select()
  instruments.value = data
}

const addToAds = async () => {
  const { error, data } = await supabase.from('ads').insert({
    title: 'test',
    description: 'test description',
    price: '300',
    discount: '30',
    if_discount: true,
  })
  if (error) {
    console.error('Fehler beim Speichern:', error)
  } else {
    console.log('Gespeichert:', data)
  }
}
function clickFunction() {
  clickStore.toggleClick() // Call the action to toggle isClicked
}
onMounted(() => {
  // addToAds()
  getInstruments()
  console.log(instruments)
})
</script>

<template>
  <main class="bg-gray-100">
    <div class="w-[100%]">
      <div class="flex items-center justify-around p-8">
        <Search :data="instruments" />
        <AddAnAd @clicked="clickFunction" :title="'Add an Ad'" />
      </div>
      <div
        :class="
          clickStore.isClicked
            ? 'fixed top-1/3 right-0 translate-0 transition-all duration-500 ease-in-out'
            : 'fixed top-1/3 right-0 translate-x-full transition-all duration-500 easy-in-out'
        "
      >
        <UploadAd />
      </div>
      <div class="w-[95%] min-h-[50vh] mx-auto bg-amber-500 rounded-xl m-4">
        <p class="text-2xl text-gray-800 font-semibold p-6 w-full text-center">
          Sections on the S'LX service
        </p>

        <ul class="flex flex-wrap items-center gap-12 p-8">
          <li
            v-for="ad in adType"
            :key="ad.title"
            class="flex flex-col items-center justify-center gap-3 bg-amber-500 rounded-full p-4"
          >
            <Icon :icon="ad.icon" width="34" height="34" />{{ ad.title }}
          </li>
        </ul>
      </div>

      <!-- Anouncement section -->
      <div>
        <h2 class="text-3xl m-4 w-full text-center p-12">VIP-Announcements</h2>

        <div class="p-40 bg-gray-200 rounded-xl">some announcement</div>
      </div>
    </div>
  </main>
  <footer>
    <div class="bg-gray-800 p-4 text-center text-white">Copyright &copy; 2025</div>
  </footer>
</template>
