<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'
import { useRoute } from 'vue-router'
import { ref, onMounted, computed, watch, toRefs } from 'vue'
import type { AdsType } from '@/types/ads-type'

import { useGetUserStore } from '../stores/current-user-store'
import Button from './ui/button/Button.vue'
const userStore = useGetUserStore()
const route = useRoute()
const isFavorite = ref<boolean>(false)
const { user } = toRefs(userStore)

const props = defineProps<{
  title?: string
  description?: string
  img?: string
  price?: string
  id?: string | number
  user_name?: string
  created_at?: string
  type?: string
  size?: string
  horisontal?: boolean
  col?: boolean
  if_favorite?: boolean
}>()

const {
  title,
  description,
  img,
  price,
  id,
  user_name,
  created_at,
  type,
  size,
  horisontal,
  col,
  if_favorite,
} = toRefs(props)

const addToFavorites = async (val: any) => {
  const { data, error } = await supabase.from('favorites').select('*').eq('ad_id', val.id)
  console.log(data)
  if (error) {
    console.log(error)
  }

  if (data?.length) {
    const { data: dataDelete, error: errorDelete } = await supabase
      .from('favorites')
      .delete()
      .eq('ad_id', val.id)
    if (!errorDelete) {
      isFavorite.value = false
    } else {
      console.log(errorDelete)
    }
  }
  if (!data?.length) {
    const { data: dataCreate, error: errorCreate } = await supabase.from('favorites').insert({
      user_id: user.value.id,
      ad_id: val.id,
      img: val.img,
      title: val.title,
      description: val.description,
      price: val.price,
    })
    if (!errorCreate) {
      isFavorite.value = true
    } else {
      console.log(errorCreate)
    }
  }
}

const checkFavorites = async (ad_id: string) => {
  // console.log(ad_id)
  const { data, error } = await supabase
    .from('favorites')
    .select('ad_id')
    .eq('ad_id', ad_id)
    .eq('user_id', user.value.id)
    .maybeSingle()

  // console.log(data)
  if (route.name === 'contact') {
    isFavorite.value = true
  } else {
    isFavorite.value = !!data
  }
}

onMounted(() => {
  checkFavorites(id.value as string)

  // const channel = supabase
  //   .channel('favorites')
  //   .on(
  //     'postgres_changes',
  //     {
  //       event: '*',
  //       schema: 'public',
  //       table: 'favorites',
  //       filter: `user_id=eq.${user.value.id}`,
  //     },
  //     () => checkFavorites(id.value as string),
  //   )
  //   .subscribe()
})
</script>

<template>
  <div class="bg-white"></div>
  <div>
    <Button
      @click.stop="addToFavorites(props)"
      :class="
        isFavorite
          ? 'text-red-600 rounded-full w-8 h-8 bg-white hover:bg-white shadow '
          : 'text-black rounded-full w-8 h-8 bg-white hover:bg-white shadow'
      "
    >
      <Icon :icon="isFavorite ? 'mdi:heart' : 'mdi:heart'" width="20" height="20" />
    </Button>
  </div>
</template>

<style scoped></style>
