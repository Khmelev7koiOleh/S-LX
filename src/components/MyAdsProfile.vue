<script setup lang="ts">
import { ref, onMounted, toRefs } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useGetUserStore } from '@/stores/current-user-store'
import AdCard from '../components/AdCard.vue'

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const ads = ref<any[]>([])

const getAds = async () => {
  const { data, error } = await supabase.from('ads').select('*').eq('user_id', user.value.id)
  if (!error && data) {
    ads.value = data.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    console.log(data)
  }
}

onMounted(() => {
  getAds()
})
</script>
<template>
  <div class="w-full flex flex-col gap-4 justify-center items-center p-4">
    <!-- <div class="text-2xl uppercase">Your ads</div> -->
    <p class="text-sm font-light underline">Ads that you have created</p>
  </div>
  <div class="w-full flex justify-center">
    <div class="w-[90%] flex flex-wrap gap-20 justify-start">
      <div v-for="ad in ads" :key="ad.id">
        <RouterLink :to="`/ad/${ad.id}`">
          <AdCard
            :title="ad.title"
            :description="ad.description"
            :price="ad.price"
            :id="ad.id"
            :img="ad.img[0] || ''"
            :user_name="ad.user_name"
            :type="ad.type"
            :size="'300px'"
            :h_size="'250px'"
            :w_container="'300px'"
            :h_container="'350px'"
            :horisontal="true"
            :col="true"
            :is_user_name="false"
            :created_at="ad.created_at || ''"
            :if_favorite="false"
            :if_discount="ad.if_discount"
            :discount="ad.discount"
          />
        </RouterLink>
      </div>
    </div>
    <!-- <AdCard :data="ads" /> -->
  </div>
  <!-- <div class="text-white bg-black p-4">{{ ads }}</div> -->
</template>

<style scoped></style>
