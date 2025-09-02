<script setup lang="ts">
import { ref, toRefs, onMounted, onUnmounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useGetUserStore } from '@/stores/current-user-store'

import { Icon } from '@iconify/vue'

import type { Tables } from '@/types/supabase'
import { useRouter } from 'vue-router'
import { useSupabaseSubscription } from '@/composables/useSupabaseSubscription'
import { useChatStore } from '@/stores/chat-store'
import Button from '@/components/ui/button/Button.vue'
import { useGetAverageRating } from '@/composables/get-average-rating'
import { useRateUser } from '@/composables/rate-user'
import { useWindowSize } from '@/composables/useWindowSize'
import { useRatingsStore } from '@/stores/rating-store'

const { isPhone } = useWindowSize()
const userStore = useGetUserStore()
const { user } = toRefs(userStore)
const { subscribe, unsubscribe } = useSupabaseSubscription()
const { getAverageRating } = useGetAverageRating()

const chatStore = useChatStore()

const router = useRouter()

const isEmail = ref<boolean>(false)
const isRating = ref<boolean>(false)
const isChatButton = ref<boolean>(false)
const isMainInfo = ref<boolean>(false)

const currentRoom = ref<Tables<'chat_rooms'> | null>(null)

const onHintOpen = ref<boolean>(false)
const ratingStore = useRatingsStore()
const rating = computed(() => ratingStore.rating)

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
  data: {
    type: Object as () => Tables<'user'>,
    required: true,
  },
  start: {
    type: Boolean,
    required: false,
  },
  center: {
    type: Boolean,
    required: false,
  },
  end: {
    type: Boolean,
    required: false,
  },
  bg: {
    type: String,
    required: false,
  },
  routerOn: {
    type: Boolean,
    required: false,
  },
  is_visable: {
    type: Boolean,
    required: false,
  },
  main_info: {
    type: Boolean,
    required: false,
  },
  main_info_confirm: {
    type: Boolean,
    required: false,
  },
})
const { data, start, center, end, bg, routerOn } = toRefs(props)
const { rateUser } = useRateUser()
// console.log(data.value)
info.value = data.value
const goToChat = (chat: Tables<'chat_rooms'>) => {
  console.log(chat)
  chatStore.currentChat = chat
  router.push(`/chats/${chat.room_id}`)
}
async function createChatRoom(user1_id: string, user2_id: string) {
  console.log(user1_id, user2_id)
  const room_id = [user1_id, user2_id].sort().join('_')
  const { data: dataCheck } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('room_id', room_id)
    .maybeSingle()
  if (dataCheck) {
    console.log(user.value)
    console.log(dataCheck)
    goToChat(dataCheck)
  } else {
    const { data } = await supabase
      .from('chat_rooms')
      .upsert(
        {
          room_id,
          participant_ids: [user1_id, user2_id],
          room_topic: dataCheck ? dataCheck.room_topic : info.value.name,
        },
        { onConflict: 'room_id' },
      )
      .select()
      .single()
    currentRoom.value = data
    console.log(data)
    if (data) {
      goToChat(data)
    }

    return data
  }
  return dataCheck
}

const computedStars = computed(() => {
  const stars = []
  const fullStars = Math.floor(rating.value)
  const hasHalfStar = rating.value % 1 >= 0.25 && rating.value % 1 <= 0.75
  const totalStars = 5
  for (let i = 1; i <= totalStars; i++) {
    if (i <= fullStars) {
      stars.push('material-symbols:star')
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push('material-symbols:star-half')
    } else {
      stars.push('material-symbols:star-outline')
    }
  }

  return stars
})
const computedRating = computed(() => {
  if (!rating.value) return 'This user has not been rated yet'
  return rating.value.toFixed(1) + ' / 5.0'
})

const justifyComputed = computed(() => {
  if (start.value) return 'justify-start'
  if (center.value) return 'justify-center'
  if (end.value) return 'justify-end'
  return 'justify-center'
})

const goToProfile = (id: string) => {
  if (!isEmail.value && !isRating.value && !isChatButton.value) return
  else if (routerOn.value && id) return router.push(`/user-profile/${id}`)
  else {
    return
  }
}

const hideProfileData = () => {
  if (props.is_visable) {
    {
      isEmail.value = !isEmail.value
      isRating.value = !isRating.value
      isChatButton.value = !isChatButton.value
      isMainInfo.value = !isMainInfo.value
    }
  } else return
}

onMounted(async () => {
  ratingStore.id = props.data.id
  subscribe(
    {
      event: '*',
      schema: 'public',
      table: 'ratings',
      filter: `target_user_id=eq.${props.data.id}`,
    },
    async (payload) => {
      console.log('Realtime change:', payload)
      await getAverageRating(props.data.id)
    },
  )
  await getAverageRating(props.data.id)
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <div @click.stop.prevent="hideProfileData()" class="w-full h-full py-0 px-0 md:py-4 md:px-0">
    <div
      :class="[
        ' h-full flex justify-center items-center gap-10 rounded-sm  ',
        justifyComputed,
        bg,
        isPhone ? 'flex-col  ' : 'flex-row',
        isEmail && isRating && isChatButton ? 'w-[80vw] p-2  ' : 'p-4',
      ]"
    >
      <div class="w-fit flex flex-col justify-center items-start px-[2%] md:px-[5%]">
        <div @click="goToProfile(info.id)" class="flex justify-start items-center gap-4 md:gap-8">
          <div class="w-full h-full flex justify-center items-center">
            <img
              :src="info.img ?? ''"
              :class="
                isRating && isEmail && isChatButton
                  ? 'rounded-full object-cover min-w-[80px] min-h-[80px] w-[80px] h-[80px] md:min-w-[120px] md:min-h-[120px] md:w-[120px] md:h-[120px] transition-all duration-700 ease-in-out '
                  : 'rounded-full object-cover min-w-[90px] min-h-[90px] w-[90px] h-[90px] md:min-w-[150px] md:min-h-[150px] md:w-[150px] md:h-[150px] transition-all duration-700 ease-in-out '
              "
              :width="isPhone ? 90 : 150"
              :height="isPhone ? 90 : 150"
              alt=""
            />
          </div>
          <div class="flex flex-col justify-center items-start gap-3">
            <div class="text-lg md:text-xl text-gray-800 font-mono">{{ info.name }}</div>
            <div
              v-if="props.is_visable ? isEmail : true"
              class="text-sm md:text-md text-gray-800 font-mono truncate"
            >
              {{ info.email }}
            </div>

            <div class="w-full min-w-[200px] flex flex-col justify-center items-start gap-2">
              <div
                v-if="props.is_visable ? isRating : true"
                :class="
                  computedRating == 'This user has not been rated yet'
                    ? 'w-full flex flex-col  justify-start items-center gap-2'
                    : 'w-full flex justify-start items-center gap-2  '
                "
              >
                <div
                  :class="
                    computedRating == 'This user has not been rated yet'
                      ? ' text-gray-800 text-sm md:text-sm font-light '
                      : 'text-gray-800 text-sm md:text-sm font-light'
                  "
                >
                  {{ computedRating }}
                </div>

                <div class="flex justify-start items-center">
                  <Icon
                    v-for="(icon, i) in computedStars"
                    @click="rateUser(info.id, user.id, i + 1)"
                    :key="i"
                    :icon="icon"
                    width="24"
                    height="24"
                    class="text-yellow-400"
                  />
                </div>
              </div>
              <div
                v-if="props.is_visable ? isChatButton : true"
                class="w-full flex justify-end items-center"
              >
                <Button @click="createChatRoom(user.id, info.id)" class="w-full">
                  <Icon icon="material-symbols:chat" width="24" height="24" />
                  <div class="text-sm md:text-md text-gray-300 font-mono">Chat {{ info.name }}</div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="
          main_info && isPhone ? main_info_confirm : true && props.is_visable ? isMainInfo : true
        "
        class="w-[90vw] md:w-auto flex justify-start items-start relative"
      >
        <div v-if="info" class="text-black p-4">
          <div class="flex flex-col justify-start items-start gap-8">
            <div class="relative flex justify-between items-cente gap-2 px-0 md:px-4">
              <span class="text-md font-semibold text-gray-600">Main information</span>
              <button @mouseenter="onHintOpen = true" @mouseleave="onHintOpen = false">
                <Icon icon="mdi:eye" width="20" height="20" />
              </button>

              <div
                v-if="onHintOpen"
                class="w-[200px] absolute bottom-full left-[80%] flex justify-center items-center bg-gray-800 rounded-md break-words whitespace-break-spaces px-2 py-1 shadow"
              >
                <p
                  class="w-full text-[11px] text-white font-mono break-words whitespace-break-spaces"
                >
                  User can leave additional information here
                </p>
              </div>
            </div>

            <div class="w-full flex flex-col gap-4 px-0 md:px-4">
              <div class="w-full">
                <p class="text-sm font-extralight">
                  <span class="inline-block w-auto text-gray-600 font-semibold text-md"
                    >Description:</span
                  >
                  <span
                    class="align-top px-2 text-sm font-light"
                    :class="isEmail && isRating && isChatButton ? 'line-clamp-2' : ''"
                    >{{ info.description ?? 'there is no description' }}</span
                  >
                </p>
              </div>

              <div class="w-full">
                <p class="text-sm font-extralight">
                  <span class="inline-block w-auto text-gray-600 font-semibold text-md"
                    >Location:</span
                  >
                  <span class="align-top px-2 text-sm font-light">{{
                    info.location ?? 'there is no location'
                  }}</span>
                </p>
              </div>

              <div class="w-full">
                <p class="text-sm font-extralight">
                  <span class="inline-block w-auto text-gray-600 font-semibold text-md">Tel:</span>
                  <span class="align-top px-2 text-sm font-light">{{
                    info.tel ?? 'there is no tel'
                  }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
