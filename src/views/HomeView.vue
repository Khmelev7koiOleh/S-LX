<script setup lang="ts">
import { ref, onMounted, computed, toRefs } from 'vue'
import { Icon } from '@iconify/vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { supabase } from '../lib/supabaseClient'
import Search from '@/components/icons/Search.vue'
import AddAnAd from '@/components/icons/AddAnAd.vue'
import { adType } from '@/data/ad-type'
import type { AdsType } from '@/types/ads-type'
import { useClickFunctionStore } from '@/stores/click-function-store'
import UploadAd from '@/components/UploadAd.vue'
import { getAllAds } from '../composables/get-ads'
import AdCard from '../components/AdCard.vue'
import { useRouter } from 'vue-router'
import { useFilterStore } from '../stores/filter-store'
import AdvertisementBanner from '@/components/AdvertisementBanner.vue'
import AdvertisementLine from '@/components/AdvertisementLine.vue'
import PopularSomethigComponent from '@/components/PopularSomethigComponent.vue'
import { title } from 'process'
import { useGetUserStore } from '../stores/current-user-store'
import { useWindowSize } from '@/composables/useWindowSize'

const { width, height, isPhone, isTablet, isLaptop } = useWindowSize()

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const router = useRouter()
const { ads } = getAllAds()

interface adType {
  id: number
  title: string
  description: string
  price: string
  discount: string
  if_discount: boolean
  type: string
}

// interface Instrument {
//   id: number
//   name: string
// }
const filterStore = useFilterStore()

const { selectedCategory } = toRefs(filterStore)
const clickStore = useClickFunctionStore() // Access the store

// const instruments = ref<Instrument[] | null>([])

const searchQuery = ref<string>('')

const filteredAds = computed(() => {
  if (searchQuery.value) {
    return ads.value.filter(
      (ad: adType) =>
        ad.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  } else {
    return []
    // Return an empty array instead of an empty string
  }
})

// async function getInstruments() {
//   const { data } = await supabase.from('instruments').select()
//   instruments.value = data
// }

// const addToAds = async () => {
//   const { error, data } = await supabase.from('ads').insert({
//     title: 'test',
//     description: 'test description',
//     price: '300',
//     discount: '30',
//     if_discount: true,
//   })
//   if (error) {
//     console.error('Fehler beim Speichern:', error)
//   } else {
//     console.log('Gespeichert:', data)
//   }
// }
const PopularComponentData = ref([
  {
    img: 'https://www.olx.ua/app/static/media/olx_category.f0c6831ac.svg',
    title: "Sections on the S'LX",
    data: adType,
  },
  {
    img: 'https://www.olx.ua/app/static/media/observed_search.17aec4d21.svg',
    title: 'Popular queries',
    data: adType,
  },
])

const lorem = ref([
  {
    text: 'Lorinctio est ipsam et esse quos',
  },
  {
    text: 'Lorinctio est ipsam et esse quos',
  },
  {
    text: 'Lorinctio est ipsam et esse quos',
  },
  {
    text: 'Lorinctio est ipsam et esse quos',
  },
  {
    text: 'Lorinctio est ipsam et esse quos',
  },
  {
    text: 'Lorinctio est ipsam et esse quos',
  },
  {
    text: 'Lorinctio est ipsam et esse quos',
  },
])

const getValueOf = (ref: string) => {
  console.log(ref)
  selectedCategory.value = ref
  router.push(`/about/`)
}

function clickFunction() {
  clickStore.isClicked = !clickStore.isClicked // Call the action to toggle isClicked
}

const randomReducedAds = computed(() => {
  return ads.value.slice(0, 12).sort(() => Math.random() - 0.5)
})

onMounted(() => {
  // addToAds()
  // getInstruments()

  console.log(ads)
})
</script>

<template>
  <main class="bg-gray-100">
    <div class="p-4">
      <p>Width: {{ width }}px</p>
      <p>Height: {{ height }}px</p>

      <p v-if="isPhone">You're on a phone 📱</p>
      <p v-else-if="isTablet">You're on a tablet 💻</p>
      <p v-else-if="isLaptop">You're on a laptop 💻</p>
    </div>
    <div class="w-[100%]">
      <div class="flex items-center justify-around p-8">
        <div class="relative w-1/2 bg-amber-200">
          <Search v-model="searchQuery" />
          <ul
            v-if="searchQuery"
            class="w-[48%] h-[40%] fixed mt-2 flex flex-col gap-1 bg-white rounded-lg overflow-auto px-2 z-10"
          >
            <li v-for="ad in filteredAds" :key="ad.id">
              <!-- <div class="w-full flex justify-center">
              <div class="border-b w-2/2"></div>
            </div> -->
              <RouterLink :to="`/ad/${ad.id}`">
                <AdCard
                  :title="ad.title"
                  :description="ad.description"
                  :price="ad.price"
                  :id="ad.id"
                  :img="ad.img[0] || ''"
                  :type="ad.type"
                  :h_size="'50px'"
                  :size="'100px'"
                  :horisontal="false"
                  :col="false"
                  :created_at="ad.created_at"
                  :if_favorite="false"
                  :user_name="ad.user_name"
                  :schrink="true"
                  :start="false"
                  :center="false"
                  :end="true"
                />
              </RouterLink>
            </li>
            <div
              v-if="searchQuery.length > 0 && filteredAds.length === 0"
              class="text-center text-2xl font-bold"
            >
              Nothing found
            </div>
          </ul>
        </div>
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
      <div></div>
      <!-- <div class="flex"> -->
      <!-- <div v-for="ad in selectedCategory" :key="ad.id">
          <AdCard
            :title="ad.title"
            :description="ad.description"
            :price="ad.price"
            :id="ad.id"
            :img="ad.img || ''"
            :type="ad.type"
          />
        </div> -->
      <!-- </div> -->
      <div class="w-[95%] min-h-[50vh] mx-auto bg-amber-500 rounded-xl m-4">
        <p class="text-2xl text-gray-800 font-semibold p-6 w-full text-center">
          Sections on the S'LX service
        </p>

        <ul class="flex flex-wrap items-center gap-12 p-8">
          <li
            @click="getValueOf(ad.value)"
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
        <h2 class="text-3xl w-full text-center p-12">VIP-Announcements</h2>
        <ul
          :class="
            isPhone
              ? ' w-full grid grid-cols-2 justify-center items-center gap-8 p-4'
              : ' w-full grid grid-cols-4 gap-4 p-20'
          "
        >
          <li v-for="ad in randomReducedAds" :key="ad.id">
            <RouterLink :to="`/ad/${ad.id}`">
              <AdCard
                :title="ad.title"
                :description="ad.description"
                :price="ad.price"
                :id="ad.id"
                :img="ad.img[0] || ''"
                :if_discount="ad.if_discount"
                :discount="ad.discount"
                :type="ad.type"
                :h_size="isPhone ? '120px' : '200px'"
                :size="isPhone ? '180px' : '300px'"
                :w_container="isPhone ? '180px' : '300px'"
                :h_container="isPhone ? '250px' : '350px'"
                :horisontal="true"
                :col="true"
                :created_at="ad.created_at"
                :if_favorite="true"
                :user_name="ad.user_name"
                @navigate="(id) => router.push(`/ad/${id}`)"
              />
            </RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <AdvertisementLine />

        <div class="w-full flex flex-wrap">
          <div v-for="shard in PopularComponentData" :key="shard.title" class="w-1/2 flex">
            <PopularSomethigComponent :img="shard.img" :title="shard.title" :data="shard.data" />
          </div>

          <!-- <div class="max-w-1/2">
            <PopularSomethigComponent />
          </div> -->
        </div>
        <AdvertisementBanner />
      </div>
    </div>
    <div class="w-full border-b border-b-gray-800"></div>
  </main>
  <footer>
    <div class="text-center text-2xl">Footer</div>
    <div class="w-full p-8">
      <div class="flex justify-start items-start gap-8 h-[300px]">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent v-for="l in lorem" :key="l.text"> {{ l.text }} </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible2?</AccordionTrigger>
            <AccordionContent v-for="l in lorem" :key="l.text"> {{ l.text }} </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div class="bg-white p-4 text-center text-white">Copyright &copy; 2025</div>
    </div>
  </footer>
</template>
