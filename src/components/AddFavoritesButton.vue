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
  price?: number
  id: string | number
  user_name?: string
  created_at?: string
  type?: string
  size?: string
  horisontal?: boolean
  col?: boolean
  if_favorite?: boolean
  if_discount?: boolean
  discount?: string
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
  if_discount,
  discount,
} = toRefs(props)

const addToFavorites = async (
  title: string | undefined,
  description: string | undefined,
  img: string | undefined,
  price: number | undefined,
  id: string | number,
  if_discount: boolean | undefined,
  discount: string | undefined,
) => {
  console.log(title, description, img, price, id, if_discount, discount)
  if (!id) return

  const { data, error } = await supabase.from('favorites').select('*').eq('id', id)
  console.log(data)
  if (error) {
    console.log(error)
  }

  if (data?.length) {
    console.log(id)
    console.log('delete the favorite')
    const { data: dataDelete, error: errorDelete } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id)
    if (!errorDelete) {
      isFavorite.value = false
    } else {
      console.log(errorDelete)
    }
  }
  if (!data?.length) {
    console.log(id)
    console.log('insert the favorite')
    const { data: dataCreate, error: errorCreate } = await supabase.from('favorites').insert({
      user_id: user.value.id,
      id: id,
      img: [img],
      title: title,
      description: description,
      price: price,
      if_discount: if_discount,
      discount: discount,
    })
    if (!errorCreate) {
      isFavorite.value = true
    } else {
      console.log(errorCreate)
    }
  }
}

const getFavorites = async (id: string) => {
  // console.log(ad_id)
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.value.id)
    .maybeSingle()

  // console.log(data)
  if (route.name === 'favorites') {
    isFavorite.value = true
  } else {
    isFavorite.value = !!data
  }
}

// function subscribeToRoom(id: string, callback: (newMessage: any) => void) {
//   return supabase
//     .channel(`favorites:user:${user.value.id}`)
//     .on(
//       'postgres_changes',
//       {
//         event: '*',
//         schema: 'public',
//         table: 'favorites',
//         filter: `user_id=eq.${user.value.id}`,
//       },
//       (payload) => callback(payload.new),
//     )
//     .subscribe()
// }

onMounted(() => {
  getFavorites(id.value as string)

  supabase
    .channel(`favorites:user:${user.value.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'favorites',
        filter: `user_id=eq.${user.value.id}`,
      },
      () => {
        getFavorites(id.value as string)
      },
    )
    .subscribe()
})
</script>

<template>
  <div class="bg-white">
    <!-- <Button @click.stop.prevent="getFavorites(id as string)"> click</Button> -->
  </div>
  <div>
    <Button
      @click.stop.prevent="
        addToFavorites(title, description, img, price, id, if_discount, discount)
      "
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
