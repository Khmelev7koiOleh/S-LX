<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
// import { supabase } from '../lib/supabaseClient'
import Search from '@/components/icons/Search.vue'
import AddAnAd from '@/components/icons/AddAnAd.vue'
import { adType } from '@/data/ad-type'
// import type { AdsType } from '@/types/ads-type'
import { useClickFunctionStore } from '@/stores/click-function-store'
import UploadAd from '@/components/UploadAd.vue'
import { getAllAds } from '../composables/get-ads'
import AdCard from '../components/AdCard.vue'
import { useRouter } from 'vue-router'
// import { useFilterStore } from '../stores/filter-store'
import AdvertisementBanner from '@/components/AdvertisementBanner.vue'
import AdvertisementLine from '@/components/AdvertisementLine.vue'
import PopularSomethigComponent from '@/components/PopularSomethigComponent.vue'

// import { useGetUserStore } from '../stores/current-user-store'
import { useWindowSize } from '@/composables/useWindowSize'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
// import { Database } from '@/types/supabase'
import { useGetAdCategory } from '../composables/get-ad-category'
import type { Tables } from '@/types/supabase'
// import { useGetUserComposable } from '../composables/get-user'
// <const { user: userw, loading, error, getUser } = useGetUserComposable()>

// const frf = async () => {
//   await getUser(['ab8818d9-1a18-4eaa-9981-4c40562c014a', 'a4066069-bff7-43a9-b6f7-775906b8fde9'])
//   console.log(userw.value)
// }
// onMounted(() => {
//   frf()
//   console.log(userw.value)
// })
// console.log(userw.value) // Typed as Tables<'user'>[]

const { isPhone, isLaptop } = useWindowSize()

// const userStore = useGetUserStore()
// const { user } = toRefs(userStore)
const { getValueOf } = useGetAdCategory()
const router = useRouter()
const { ads } = getAllAds()

// interface adType {
//   id: number
//   title: string
//   description: string
//   price: string
//   discount: string
//   if_discount: boolean
//   type: string
// }

// const filterStore = useFilterStore()

// const { selectedCategory } = toRefs(filterStore)
const clickStore = useClickFunctionStore() // Access the store

const searchQuery = ref<string>('')

const filteredAds = computed<Tables<'ads'>[]>(() => {
  if (searchQuery.value) {
    return ads.value.filter(
      (ad) =>
        ad.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        ad.description?.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  } else {
    return []
  }
})

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

function clickFunction() {
  clickStore.isClicked = !clickStore.isClicked // Call the action to toggle isClicked
}

const randomReducedAds = computed(() => {
  return ads.value.slice(0, 12).sort(() => Math.random() - 0.5)
})
const handleCategory = (category: string) => {
  getValueOf(category)
}
onMounted(() => {
  console.log(ads)
})
</script>

<template>
  <main class="bg-gray-100">
    <div class="w-[100%]">
      <div
        :class="
          isPhone
            ? ' flex flex-col items-center justify-around gap-8 p-8'
            : 'flex flex-row items-center justify-around p-8'
        "
      >
        <div :class="isPhone ? 'w-full relative  bg-amber-200' : 'relative w-1/2 bg-amber-200'">
          <Search v-model="searchQuery" />
          <ul
            v-if="searchQuery"
            :class="
              isPhone
                ? ' w-[100%] h-[29vh] absolute mt-2 flex flex-col gap-1 bg-white rounded-lg overflow-auto px-2  py-2 z-10'
                : ' w-[100%] h-[29vh] absolute mt-2 flex flex-col gap-1 bg-white rounded-lg overflow-auto px-2  py-2 z-10 '
            "
          >
            <li v-for="ad in filteredAds" :key="ad.id">
              <RouterLink :to="`/ad/${ad.id}`">
                <AdCard
                  :title="ad.title || null"
                  :description="ad.description"
                  :price="ad.price"
                  :id="ad.id"
                  :img="[ad.img?.[0] || '']"
                  :if_discount="null"
                  :discount="null"
                  :type="ad.type"
                  :h_size="'70px'"
                  :size="'100px'"
                  :horisontal="false"
                  :col="false"
                  :created_at="ad.created_at"
                  :if_favorite="false"
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
        v-if="clickStore.isClicked"
        :class="
          clickStore.isClicked
            ? 'fixed bottom-0 right-0 translate-0 transition-all duration-500 ease-in-out z-10 '
            : 'fixed bottom-0 right-0 translate-x-full transition-all duration-500 easy-in-out z-10'
        "
      >
        <UploadAd />
      </div>

      <div
        :class="
          isPhone
            ? 'w-[95%] min-h-[50vh] mx-auto flex flex-col justify-center items-center  m-4'
            : 'w-[95%] min-h-[50vh] mx-auto bg-amber-500 rounded-xl m-4'
        "
      >
        <p class="text-2xl text-gray-800 font-semibold pb-12 pt-4 w-full text-center">
          Sections on the S'LX service
        </p>

        <ul
          v-if="isLaptop"
          :class="
            isPhone
              ? 'w-full    p-0'
              : 'w-full flex flex-wrap justify-start items-center gap-12 p-8'
          "
        >
          <li @click="handleCategory(ad.value)" v-for="ad in adType" :key="ad.title">
            <div
              class="flex flex-col items-center justify-center gap-3 bg-amber-500 rounded-full p-4"
            >
              <Icon :icon="ad.icon" width="34" height="34" />{{ ad.title }}
            </div>
          </li>
        </ul>
        <Carousel
          v-if="isPhone"
          :opts="{
            align: 'start',
            loop: true,
          }"
          :plugins="[
            Autoplay({
              delay: 2000,
            }),
          ]"
          class="relative w-full"
        >
          <div class="p-2">
            <div class="absolute bottom-full right-[20%]">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </div>
          <CarouselContent>
            <CarouselItem
              @click="getValueOf(ad.value)"
              v-for="ad in adType"
              :key="ad.title"
              :class="
                isPhone
                  ? 'basis-1/3 flex flex-col items-center justify-center gap-3 p-4'
                  : 'flex flex-col items-center justify-center gap-3 bg-amber-500 rounded-full p-4'
              "
            >
              <div class="p-1">
                <Card class="bg-transparent border-none shadow-none">
                  <CardContent
                    class="w-[100px] flex flex-col aspect-square items-center justify-center gap-3 p-1"
                  >
                    <div class="shadow p-2 rounded-full">
                      <Icon :icon="ad.icon" width="34" height="34" />
                    </div>
                    {{ ad.title }}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      <!-- Anouncement section -->
      <div>
        <h2 class="text-3xl w-full text-center p-12">VIP-Announcements</h2>
        <ul
          :class="
            isPhone
              ? ' w-full  grid grid-cols-2 justify-center items-center gap-4  py-8 '
              : ' w-full grid grid-cols-4 gap-4 p-20 justify-center items-center  py-2'
          "
        >
          <li
            v-for="ad in randomReducedAds"
            :key="ad.id"
            class="w-full flex flex-col justify-center items-center"
          >
            <RouterLink :to="`/ad/${ad.id}`">
              <AdCard
                :title="ad.title"
                :description="ad.description"
                :price="ad.price"
                :id="ad.id"
                :img="[ad.img?.[0] || '']"
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
                @navigate="(id: string) => router.push(`/ad/${id}`)"
              />
            </RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <div class="pt-10">
          <AdvertisementLine />
        </div>

        <div class="w-full flex flex-wrap">
          <div v-for="shard in PopularComponentData" :key="shard.title" class="w-1/2 flex">
            <PopularSomethigComponent :img="shard.img" :title="shard.title" :data="shard.data" />
          </div>
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
<style scoped></style>
