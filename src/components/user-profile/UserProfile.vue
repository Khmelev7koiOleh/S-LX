<script setup lang="ts">
import { ref, toRefs, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

import type { RealtimeChannel } from '@supabase/supabase-js'

import AdCard from '../AdCard.vue'
import { RouterLink } from 'vue-router'

import ReusableUserProfile from '@/components/reusable/ReusableUserProfile.vue'
import { getAllAds } from '@/composables/get-ads'
import { useWindowSize } from '@/composables/useWindowSize'
import type { Tables } from '@/types/supabase'
const { isPhone } = useWindowSize()

const { fetchAds, ads } = getAllAds()

const rating = ref<number>(0)
const info = ref<Tables<'user'>>({
  created_at: '',
  name: '',
  email: '',
  id: '',
  img: '',
  description: '',
  location: '',
  tel: '',
  user_id: '',
})

const props = defineProps({
  id: String,
})
const { id } = toRefs(props)

const getAverageRating = async (targetUserId: string) => {
  console.log('getAverageRating', targetUserId)

  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('target_user_id', targetUserId)
  if (data) {
    rating.value = data.reduce((acc, rating) => acc + rating.rating, 0) / data.length
  } else {
    console.log(error)
  }
}
let ratingSubscription: RealtimeChannel | null = null
const subscribeToRatings = (targetUserId: string) => {
  ratingSubscription = supabase
    .channel('ratings-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ratings',
        filter: `target_user_id=eq.${targetUserId}`,
      },
      (payload) => {
        console.log('Realtime change:', payload)
        getAverageRating(targetUserId)
      },
    )
    .subscribe()
}
const unsubscribeFromRatings = async () => {
  if (ratingSubscription) {
    await supabase.removeChannel(ratingSubscription)
  }
}

onMounted(async () => {
  const { data } = await supabase.from('user').select('*').eq('id', id?.value)
  if (data && data.length > 0) {
    info.value = data[0]
  } else {
    console.log('No user data found')
  }

  subscribeToRatings(info.value.id)
  fetchAds()

  getAverageRating(info.value.id)
})
onUnmounted(() => {
  unsubscribeFromRatings()
})
</script>

<template>
  <div :class="isPhone ? 'p-2 w-full ' : ' w-full px-[5%]'">
    <div class="w-full h-full flex justify-center items-center gap-10">
      <ReusableUserProfile
        v-if="info.user_id"
        :data="info"
        :start="true"
        :center="false"
        :end="false"
        :bg="'bg-transparent'"
        :router-on="false"
        :is_visable="false"
        :main_info="true"
        :main_info_confirm="true"
      />
    </div>
    <div class="w-full border"></div>

    <div class="w-full flex justify-center items-center pb-8 p-2">
      <div class="text-xl text-gray-800 font-mono border-b">{{ info.name }}'s ads</div>
    </div>
    <div
      :class="
        isPhone
          ? ' w-full grid grid-cols-2 justify-center items-center gap-4 '
          : ' w-full grid grid-cols-4 gap-4 justify-center items-center'
      "
    >
      <div v-for="ad in ads" :key="ad.id" class="w-full flex flex-col justify-center items-center">
        <RouterLink :to="`/ad/${ad.id}`">
          <AdCard
            :title="ad.title"
            :description="ad.description"
            :price="ad.price"
            :id="ad.id"
            :img="[ad.img?.[0] || '']"
            :type="ad.type"
            :if_discount="ad.if_discount"
            :discount="ad.discount"
            :h_size="isPhone ? '120px' : '200px'"
            :size="isPhone ? '180px' : '300px'"
            :w_container="isPhone ? '180px' : '300px'"
            :h_container="isPhone ? '250px' : '350px'"
            :horisontal="true"
            :col="true"
            :is_user_name="false"
            :created_at="ad.created_at || ''"
            :if_favorite="true"
          />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
