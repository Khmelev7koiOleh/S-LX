<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabaseClient'
import { useRoute } from 'vue-router'
import { ref, onMounted, toRefs } from 'vue'
import type { Tables } from '@/types/supabase'
import 'vue-sonner/style.css' // needed for styling
import { toast } from 'vue-sonner'
import { useGetUserStore } from '../stores/current-user-store'
import Button from './ui/button/Button.vue'
const userStore = useGetUserStore()
const route = useRoute()
const isFavorite = ref<boolean>(false)
const { user } = toRefs(userStore)

const props = defineProps<{
  title: string | null
  description: string | null
  img: string[] | null
  price: number | null
  id: string | number

  created_at: string

  if_discount: boolean | null
  discount: number | null
}>()

const {
  title,
  description,
  img,
  price,
  id,

  created_at,

  if_discount,
  discount,
} = toRefs(props)

const addToFavorites = async (
  title: string | null,
  description: string | null,
  img: string | null,
  price: number | null,
  id: string | number,
  if_discount: boolean | null,
  discount: number | null,
  created_at: string,
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
      console.log(dataDelete)
      isFavorite.value = false
      toast.success(`${title} ad has been removed from favorites`)
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
      created_at: created_at,
    })
    if (dataCreate) {
      console.log(dataCreate)
    }
    if (!errorCreate) {
      toast.success(`${title} Ad has been added to favorites`)
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

  if (error) {
    console.log(error)
  }
  // console.log(data)
  if (route.name === 'favorites ') {
    isFavorite.value = true
  } else {
    isFavorite.value = !!data
  }
}

onMounted(() => {
  getFavorites(id.value as Tables<'favorites'>['id'])

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
        getFavorites(id.value as Tables<'favorites'>['id'])
      },
    )
    .subscribe()
})
</script>

<template>
  <div class="bg-white"></div>

  <div>
    <Button
      @click.stop.prevent="
        addToFavorites(
          title,
          description,
          img ? img[0] : '',
          price,
          id,
          if_discount,
          discount,
          created_at,
        )
      "
      :class="
        isFavorite
          ? 'text-red-600 rounded-full w-8 h-8 bg-white hover:bg-white shadow cursor-pointer '
          : 'text-black rounded-full w-8 h-8 bg-white hover:bg-white shadow cursor-pointer '
      "
    >
      <Icon :icon="isFavorite ? 'mdi:heart' : 'mdi:heart'" width="20" height="20" />
    </Button>
  </div>
</template>

<style scoped></style>
