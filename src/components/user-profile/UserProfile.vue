<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '@/stores/current-user-store'
import type { UserType } from '@/types/user-type'

import { Icon } from '@iconify/vue'
import ReusableUserProfile from './ReusableUserProfile.vue'
import AdCard from '../AdCard.vue'
const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const getUser = supabase.auth.getUser()
const description = ref<string>('')
const location = ref<string>('')
const tel = ref<string>('')

const imageUrl = ref<string>('')
const file = ref<File | null>(null)
const info = ref<UserType>({
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

const ads = ref<any[]>([])

const getAds = async () => {
  console.log(info.value.id)
  const { data: userAds, error } = await supabase
    .from('ads')
    .select('*')
    .eq('user_id', info.value.id)
  if (!error && info) {
    ads.value = userAds.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    console.log(info, 'dataw')
  }
}

onMounted(async () => {
  const { data, error } = await supabase.from('user').select('*').eq('id', id?.value)
  if (data && data.length > 0) {
    info.value = data[0]
  } else {
    // Handle the case where no data is found
    console.log('No user data found')
  }
  getAds()
})
</script>

<template>
  <!-- <div class="bg-fuchsia-400">{{ user.id }}</div>
  <div>{{ id }}</div>
  <div class="bg-blue-400">{{ info }}</div>
  <div class="bg-red-400"></div>

  <div class="w-full flex justify-start items-start relative">
    <div class="w-1/2 flex justify-center items-center bg-amber-500">
      <div>
        <img
          :src="info.img"
          alt=""
          width="50"
          height="50"
          class="border border-black w-[150px] h-[150px] rounded-full"
        />
      </div>
    </div>
    <div class="text-black w-1/2 p-4">
      <div class="flex flex-col justify-start items-start gap-8">
        <div class="flex justify-start items-center gap-2">
          <div class="text-md font-semibold text-gray-600">Main information</div>
          <Icon icon="mdi:eye" width="20" height="20" />
        </div>
        <div class="flex flex-col gap-4 px-4">
          <div class="flex flex-col gap-2">
            <p class="text-gray-800 text-sm font-extralight">Description</p>
            <p v-if="info.description == ''" class="px-4">there is no description</p>
            <p v-else class="px-4">{{ info.description }}</p>
          </div>
          <div class="flex flex-col gap-4">
            <p class="text-gray-800 text-sm font-extralight">Location</p>
            <p v-if="info.location == ''" class="px-4">there is no location</p>
            <p v-else class="px-4">{{ info.location }}</p>
          </div>
          <div class="flex flex-col gap-4">
            <p class="text-gray-800 text-sm font-extralight">Tel</p>
            <p v-if="info.tel == ''" class="px-4">there is no tel</p>
            <p v-else class="px-4">{{ info.tel }}</p>
          </div>
        </div>
      </div>
    </div>
  </div> -->

  <!-- <div>{{ data }}</div> -->
  <div class="min-w-[100vw] w-full min-h-[100vh] h-full bg-gray-50 p-10">
    <div class="w-full h-full flex justify-center items-center gap-10">
      <div class="">
        <div class="flex justify-center items-center gap-4">
          <div class="">
            <img
              :src="info.img"
              class="rounded-full object-cover w-[150px] h-[150px]"
              width="150"
              height="150"
              alt=""
            />
          </div>
          <div class="flex flex-col justify-center items-start gap-2">
            <div class="text-xl text-gray-800 font-mono">{{ info.name }}</div>
            <div class="text-md text-gray-800 font-mono">{{ info.email }}</div>
          </div>
        </div>
      </div>

      <div class="flex justify-center items-start relative">
        <div v-if="info" class="text-black p-4">
          <div class="flex flex-col justify-start items-start gap-8">
            <div class="flex justify-start items-center gap-2">
              <div class="text-md font-semibold text-gray-600">Main information</div>
              <Icon icon="mdi:eye" width="20" height="20" />
            </div>
            <div class="flex flex-col gap-4 px-4">
              <div class="flex justify-start items-center gap-2">
                <p class="text-gray-800">Description:</p>
                <p v-if="info.description == null" class="px-4 text-sm font-extralight">
                  there is no description
                </p>
                <p v-else class="px-4 text-sm font-extralight">{{ info.description }}</p>
              </div>
              <div class="flex justify-start items-center gap-4">
                <p class="text-gray-800">Location:</p>
                <p v-if="info.location == null" class="px-4 text-sm font-extralight">
                  there is no location
                </p>
                <p v-else class="px-4 text-sm font-extralight">{{ info.location }}</p>
              </div>
              <div class="flex justify-start items-center gap-4">
                <p class="text-gray-800">Tel:</p>
                <p v-if="info.tel == null" class="px-4 text-sm font-extralight">there is no tel</p>
                <p v-else class="px-4 text-sm font-extralight">{{ info.tel }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full border"></div>
    <!-- <div class="p-20">
      {{ ads }}
    </div> -->

    <div class="w-full flex justify-center items-center p-4">
      <div class="text-xl text-gray-800 font-mono border-b">{{ info.name }} ads</div>
    </div>
    <div class="p-10 w-full flex flex-wrap justify-start items-center gap-8">
      <div v-for="ad in ads" :key="ad.id">
        <RouterLink :to="`/ad/${ad.id}`">
          <AdCard
            :title="ad.title"
            :description="ad.description"
            :price="ad.price"
            :id="ad.id"
            :img="ad.img || ''"
            :user_name="ad.user_name"
            :type="ad.type"
            :size="'200px'"
            :h_size="'100px'"
            :w_container="'200px'"
            :h_container="'auto'"
            :horisontal="true"
            :col="true"
            :is_user_name="false"
            :created_at="ad.created_at || ''"
            :if_favorite="false"
          />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
