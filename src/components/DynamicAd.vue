<script setup lang="ts">
import { onMounted, ref, toRefs, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

import { BookUser, Check, CreditCard, Truck } from 'lucide-vue-next'
import Button from './ui/button/Button.vue'
import { useGetUserStore } from '@/stores/current-user-store'
import ChatMessageComponent from './ChatMessageComponent.vue'
import AdCard from './AdCard.vue'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import AddFavoritesButton from './AddFavoritesButton.vue'

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
import { useChatStore } from '@/stores/chat-store'
import { Icon } from '@iconify/vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import type { Tables } from '@/types/supabase'
import { useGetAdCategory } from '../composables/get-ad-category'
import { useSupabaseSubscription } from '@/composables/useSupabaseSubscription'
import { useRateUser } from '@/composables/rate-user'
import { useRatingsStore } from '@/stores/rating-store'
import { useWindowSize } from '@/composables/useWindowSize'
const { isPhone } = useWindowSize()
const { subscribe, unsubscribe } = useSupabaseSubscription()
const chatStore = useChatStore()
const { rateUser } = useRateUser()
const { getValueOf } = useGetAdCategory()

const userStore = useGetUserStore()
const { user } = toRefs(userStore)

const router = useRouter()
const route = useRoute()

const ratingStore = useRatingsStore()
const ratingId = computed(() => ratingStore.id)
const ad = ref<Tables<'ads'> | null>(null)
const userData = ref<Tables<'user'> | null>(null)
const chat = ref<Tables<'chat'>[] | null>(null)
const theMessage = ref<{ msg: string }[]>([])
const currentRoom = ref<Tables<'chat_rooms'> | null>(null)
const onDeliveryOpen = ref<boolean>(false)
const onStepperOpen = ref<boolean>(false)

const rating = computed(() => ratingStore.rating)
const onPhoneNumberShow = ref<boolean>(false)
const steps = [
  { step: 1, title: 'Address', description: 'Add your address', icon: BookUser },
  { step: 2, title: 'Shipping', description: 'Your order is on its way', icon: Truck },
  { step: 3, title: 'Payment', description: 'Complete your payment', icon: CreditCard },
  { step: 4, title: 'Confirmation', description: 'Confirm your order', icon: Check },
]
const getChat = async () => {
  const { data } = await supabase.from('chat').select('*')
  if (data) chat.value = data
}

async function createChatRoom(user1_id: string, user2_id: string) {
  console.log(user1_id, user2_id)
  const room_id = [user1_id, user2_id].sort().join('_')
  const { data } = await supabase
    .from('chat_rooms')
    .upsert(
      {
        room_id,
        participant_ids: [user1_id, user2_id],
        room_topic: ad.value?.title,
      },
      { onConflict: 'room_id' },
    )
    .select()
    .single()

  currentRoom.value = data

  return data
}
const getUser = async () => {
  const { data } = await supabase.from('user').select('*').eq('id', ad?.value?.user_id)
  if (data && data.length > 0) {
    userData.value = data[0]
  } else {
    // Handle the case where no data is found
    console.log('No user data found')
  }
}
const deleteAd = async (id: string) => {
  const { error } = await supabase.from('ads').delete().eq('id', id)
  if (error) console.log(error)
  else {
    router.push({ name: 'ads' })
  }
}

const getAverageRating = async (targetUserId: string | number) => {
  console.log('getAverageRating', targetUserId)

  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('target_user_id', targetUserId)
  if (data) {
    ratingStore.rating = data.reduce((acc, rating) => acc + rating.rating, 0) / data.length
  } else {
    console.log(error)
  }
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
  return rating.value.toFixed(1) + ' / 5'
})

const transformTime = computed(() => {
  if (ad.value?.created_at) {
    const date = new Date(ad.value.created_at)
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return formattedDate
  } else {
    return 'Unknown date'
  }
})

const handleCategory = (category: string) => {
  getValueOf(category)
}

onMounted(async () => {
  await getChat()

  const { data, error } = await supabase.from('ads').select('*').eq('id', route.params.id).single()

  if (!error) {
    ad.value = data
    userData.value = data ?? []
  }
  await getUser()
  await getAverageRating(ratingId.value as string)

  subscribe(
    {
      event: '*',
      schema: 'public',
      table: 'ratings',
      filter: `*`,
    },
    async (payload) => {
      console.log('Realtime change:', payload)
      await getAverageRating(ratingId.value as string)
    },
  )
})
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <div class="w-[100vw] h-[100vh] relative">
    <div
      v-if="onDeliveryOpen"
      class="fixed top-0 right-0 h-full z-50 bg-gray-50 overflow-auto"
      :class="isPhone ? 'w-full' : 'w-[600px]'"
    >
      <div class="flex items-center">
        <button @click="[(onDeliveryOpen = !onDeliveryOpen), (onStepperOpen = false)]" class="p-4">
          <Icon icon="mdi:arrow-left" width="34" height="34" class="text-gray-900" />
        </button>
        <div class="flex justify-center items-center gap-2 px-2">
          <h1 v-if="!onStepperOpen" class="text-2xl font-semibold">Purchase with delivery</h1>
          <h1 v-if="onStepperOpen" class="text-2xl font-semibold">Delivery</h1>
          <Icon icon="mdi:truck-delivery" width="34" height="34" class="text-gray-900" />
        </div>
      </div>

      <div
        class="w-full h-[100%] flex flex-col justify-center items-center gap-[5vh] px-4"
        v-if="onStepperOpen"
      >
        <div class="w-full flex flex-col justify-center items-center gap-4">
          <div class="w-full flex justify-center items-center gap-4">
            <Icon icon="icon-park-solid:success" width="34" height="34" class="text-green-500" />
            <p class="text-2xl text-gray-600">Order placed successfully</p>
          </div>
        </div>
        <Stepper>
          <StepperItem v-for="item in steps" :key="item.step" class="basis-1/4" :step="item.step">
            <div class="w-full h-[200px] flex flex-col">
              <div class="w-full h-[24px] flex justify-center items-start" width="24" height="24">
                <Icon
                  v-if="item.step === 1"
                  icon="icon-park-solid:success"
                  width="24"
                  height="24"
                  class="text-green-500 h-[24px ] w-[24px]"
                />
              </div>
              <StepperTrigger class="w-full flex flex-col justify-baseline items-center">
                <StepperIndicator>
                  <component :is="item.icon" class="w-4 h-4" />
                </StepperIndicator>
                <div class="flex flex-col">
                  <StepperTitle>
                    {{ item.title }}
                  </StepperTitle>
                  <StepperDescription>
                    {{ item.description }}
                  </StepperDescription>
                </div>
              </StepperTrigger>
            </div>
            <StepperSeparator
              v-if="item.step !== steps[steps.length - 1].step"
              class="w-full h-px"
            />
          </StepperItem>
        </Stepper>
        <div class="w-full flex flex-col justify-center items-center gap-8">
          <div class="text-sm font-light text-gray-600 underline">Rate this user</div>
          <div class="flex justify-center items-center gap-2">
            <img
              :src="userData?.img ?? ''"
              alt=""
              class="w-20 h-20 object-cover rounded-full"
              width="20"
              height="20"
            />
            <div class="flex flex-col justify-center items-start gap-2">
              <div class="text-xl font-semibold text-gray-600">{{ userData?.name }}</div>
              <div class="text-md font-light text-gray-600">{{ userData?.email }}</div>
            </div>
          </div>

          <div class="flex justify-start items-center gap-2">
            <p class="text-md font-semibold text-gray-600">{{ computedRating }}</p>
            <!-- not i + 1 -->
            <div class="flex justify-start items-center">
              <Icon
                v-for="(icon, i) in computedStars"
                @click="rateUser(ratingId as string, user.id, i + 1)"
                :key="i"
                :icon="icon"
                width="34"
                height="34"
                class="text-yellow-400"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="!onStepperOpen"
        class="w-full h-full flex flex-col justify-start items-start gap-4 p-4"
      >
        <div class="w-full h-full flex justify-center items-center">
          <AdCard
            :title="ad?.title || null"
            :description="ad?.description || null"
            :price="ad?.price || null"
            :id="ad?.id || ''"
            :img="[ad?.img?.[0] || '']"
            :type="ad?.type || null"
            :h_size="isPhone ? '200px' : '200px'"
            :size="isPhone ? '100%' : '400px'"
            :w_container="isPhone ? '100%' : '560px'"
            :h_container="isPhone ? '350px' : '200px'"
            :horisontal="false"
            :col="isPhone ? true : false"
            :is_user_name="true"
            :created_at="ad?.created_at || ''"
            :if_favorite="false"
            :if_discount="ad?.if_discount || null"
            :discount="ad?.discount || null"
            :discount_banner="true"
          />
        </div>
        <div class="p-4" />
        <div class="w-full flex flex-col justify-center items-start">
          <div class="w-full flex flex-col justify-start items-start gap-4">
            <p class="text-xl font-semibold text-gray-600">Delivery service</p>
            <p class="text-sm font-light text-gray-600 pl-2">Chose delivery method</p>
          </div>
          <div class="w-full flex flex-col justify-center items-start gap-8 py-8 px-8">
            <div class="w-full flex justify-start items-center gap-4 shadow-xl p-4">
              <div>
                <input
                  type="checkbox"
                  class="w-6 h-6 rounded-full border border-black appearance-none relative checked:bg-black checked:border-black checked:before:content-[''] checked:before:w-2 checked:before:h-2 checked:before:bg-white checked:before:rounded-full checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 cursor-pointer"
                />
              </div>
              <div class="w-full flex flex-col justify-center items-start gap-2">
                <p class="text-xl font-semibold text-gray-600">DHL</p>

                <p class="text-sm font-light text-gray-600">Delivery time: 2-3 days</p>
                <p class="text-sm font-light text-gray-600">Cost: $20</p>
              </div>
              <Icon
                icon="fa7-brands:dhl"
                width="70"
                height="70"
                class="w-[70px] h-[70px] self-end text-red-500"
              />
            </div>

            <div class="w-full flex justify-start items-center gap-4 shadow-xl p-4">
              <div>
                <input
                  type="checkbox"
                  class="w-6 h-6 rounded-full border border-black appearance-none relative checked:bg-black checked:border-black checked:before:content-[''] checked:before:w-2 checked:before:h-2 checked:before:bg-white checked:before:rounded-full checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 cursor-pointer"
                />
              </div>
              <div class="w-full flex flex-col justify-center items-start gap-2">
                <p class="text-xl font-semibold text-gray-600">FedEx</p>

                <p class="text-sm font-light text-gray-600">Delivery time: 2-3 days</p>
                <p class="text-sm font-light text-gray-600">Cost: $25</p>
              </div>

              <Icon
                icon="simple-icons:fedex"
                width="70"
                height="70"
                class="w-[70px] h-[70px] self-end text-purple-500"
              />
            </div>
            <div class="w-full flex justify-start items-center gap-4 shadow-xl p-4">
              <div>
                <input
                  type="checkbox"
                  class="w-6 h-6 rounded-full border border-black appearance-none relative checked:bg-black checked:border-black checked:before:content-[''] checked:before:w-2 checked:before:h-2 checked:before:bg-white checked:before:rounded-full checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 cursor-pointer"
                />
              </div>
              <div class="w-full flex flex-col justify-center items-start gap-2">
                <p class="text-xl font-semibold text-gray-600">UPS</p>

                <p class="text-sm font-light text-gray-600">Delivery time: 2-3 days</p>
                <p class="text-sm font-light text-gray-600">Cost: $22</p>
              </div>
              <Icon
                icon="fa6-brands:ups"
                width="50"
                height="50"
                class="w-[50px] h-[50px] self-end text-red-500"
              />
            </div>
          </div>
        </div>

        <div class="w-full flex flex-col justify-center items-start gap-4 pl-2">
          <div class="w-full flex flex-col justify-start items-start gap-2 my-8">
            <div class="text-xl font-semibold text-gray-600">Contact details</div>
            <p class="text-sm font-light text-gray-600 pl-2">
              Fill in the recipient's contact details
            </p>
          </div>
          <div class="w-full flex flex-col justify-start items-start gap-8 pl-8">
            <div class="w-full flex flex-col justify-start items-start gap-4 pl-8">
              <p class="text-sm font-light text-gray-600 pl-2">Name</p>
              <input
                type="text"
                class="w-[80%] shadow-md px-4 py-2"
                placeholder="Enter your name"
              />
            </div>

            <div class="w-full flex flex-col justify-start items-start gap-4 pl-8">
              <p class="text-sm font-light text-gray-600 pl-2">Email</p>
              <input
                type="text"
                class="w-[80%] shadow-md px-4 py-2"
                placeholder="Enter your email"
              />
            </div>

            <div class="w-full flex flex-col justify-start items-start gap-4 pl-8">
              <p class="text-sm font-light text-gray-600 pl-2">Phone number</p>
              <input
                type="text"
                class="w-[80%] shadow-md px-4 py-2"
                placeholder="Enter your phone number"
              />
            </div>

            <div class="w-full flex flex-col justify-start items-start gap-4 pl-8">
              <p class="text-sm font-light text-gray-600 pl-2">Address</p>
              <input
                type="text"
                class="w-[80%] shadow-md px-4 py-2"
                placeholder="Enter your address"
              />
            </div>
          </div>
          <div class="w-full flex justify-center items-center py-8">
            <button
              @click="onStepperOpen = true"
              class="w-full bg-green-500 py-3 rounded-md text-md text-white font-semibold"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="user?.id === ad?.user_id"
      :class="isPhone ? ' absolute top-14 right-2 z-10  ' : 'absolute top-8 right-8 '"
    >
      <ConfirmDialog
        message="Are you sure you want to delete this ad?"
        confirmText="Delete"
        cancelText="Cancel"
        item="ad"
        icon="mdi:dots-vertical"
        text_color="text-black"
        @confirm="() => ad?.id && deleteAd(ad?.id)"
      />
    </button>

    <div
      v-if="currentRoom && chatStore.onCurrentRoomOpen"
      class="w-1/3 h-full absolute right-0 flex flex-col justify-center items-center"
    >
      <div
        :class="
          isPhone
            ? 'w-[100%] h-1/2 fixed bottom-0 right-0 flex flex-col justify-center items-center z-10'
            : 'w-[30%] h-2/3 fixed bottom-0 right-0 flex flex-col justify-center items-center z-10'
        "
      >
        <ChatMessageComponent :data="currentRoom" :userData="userData ?? []" />
      </div>
    </div>

    <div
      :class="
        isPhone
          ? 'w-full flex flex-col justify-center items-center gap-2 px-[5vw] py-[1vh]'
          : 'w-full flex flex-row justify-center items-center gap-8 px-[10vw] py-[5vh]'
      "
      v-if="ad"
    >
      <div v-if="ad.img" class="w-full flex flex-col justify-center items-center">
        <Carousel
          :opts="{
            align: 'start',
            loop: true,
          }"
          :plugins="[
            Autoplay({
              delay: 2000,
            }),
          ]"
          :class="isPhone ? 'relative w-[100vw] max-w-xl' : 'relative w-full max-w-xl'"
        >
          <div class="absolute top-4 right-4 z-10">
            <AddFavoritesButton
              :title="ad.title"
              :description="ad.description"
              :id="ad.id"
              :img="[ad.img?.[0] || '']"
              :price="ad.price"
              :created_at="ad.created_at"
              :type="ad.type"
              :if_discount="ad.if_discount"
              :discount="ad.discount"
            />
          </div>
          <CarouselContent>
            <CarouselItem v-for="(item, index) in ad.img" :key="index">
              <div>
                <Card class="bg-white">
                  <CardContent
                    class="max-h-[500px] min-h-[500px] flex aspect-square items-center justify-center"
                  >
                    <img
                      :src="item"
                      alt=""
                      :class="
                        isPhone
                          ? 'min-w-[30vw] min-h-auto max-w-[90vw] md:max-h-[90vh] object-contain mx-auto'
                          : '  min-w-[30vw] min-h-auto max-w-[70vw] md:max-h-[70vh] object-contain mx-auto'
                      "
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div :class="isPhone ? 'absolute top-1/2 left-[15%]' : ''">
            <CarouselPrevious />
          </div>
          <div :class="isPhone ? 'absolute top-1/2 right-[15%]' : ''">
            <CarouselNext />
          </div>
        </Carousel>
        <div
          :class="
            isPhone
              ? 'w-[95vw] flex flex-col justify-center items-center gap-2 p-4 shadow m-4 rounded-md '
              : 'w-[80%] flex flex-col justify-center items-center gap-2 p-4 shadow m-4 rounded-md'
          "
        >
          <div class="w-full flex flex-col justify-center items-start gap-6">
            <div class="flex flex-col items-start justify-start">
              <p class="px-2 font-semibold">Title:</p>
              <div class="px-2 font-extralight">{{ ad.title }}</div>
            </div>

            <div class="flex flex-col items-start justify-start">
              <p class="px-2 font-semibold">Description:</p>
              <div class="px-2 font-extralight whitespace-pre-line">{{ ad.description }}</div>
            </div>
            <div class="flex items-start justify-start">
              <p class="px-2 font-semibold">Price:</p>

              <div
                class="px-2 bg-black text-white font-extralight whitespace-pre-line"
                :class="ad.if_discount ? 'line-through' : ''"
              >
                {{ ad.price }}€
              </div>
              <div v-if="ad.if_discount" class="px-2 font-extralight whitespace-pre-line">/</div>
              <div
                v-if="ad.if_discount"
                class="bg-red-400 text-white px-2 font-extralight whitespace-pre-line"
                :class="ad.if_discount ? '' : 'line-through'"
              >
                {{ ad.discount }}€
              </div>
            </div>
            <div class="flex items-center">
              <p class="px-2 font-semibold">Type:</p>
              <Button class="px-2" @click="handleCategory(ad.type || '')">{{ ad.type }}</Button>
            </div>
            <div class="flex items-center">
              <p class="px-2 font-semibold">Created at:</p>
              <div>{{ transformTime }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-fit flex flex-col justify-center items-center gap-4">
        <div v-for="sm in theMessage" :key="sm.msg">{{ sm }}</div>
      </div>

      <div
        :class="
          isPhone
            ? 'flex flex-col justify-center items-center gap-4  '
            : 'flex flex-col justify-center items-center gap-4  '
        "
      >
        <div
          :class="
            isPhone
              ? 'flex flex-col justify-center items-center gap-4 relative shadow '
              : 'flex flex-col justify-center items-center gap-4 relative shadow '
          "
        >
          <div
            :class="
              isPhone
                ? 'w-[95vw] flex flex-col justify-center items-center gap-2 bg-white  p-2 rounded-md'
                : 'w-[400px]  flex flex-col justify-center items-center gap-2 bg-white  p-2 rounded-md'
            "
          >
            <div class="text-xl font-semibold">User</div>

            <RouterLink :to="'/user-profile/' + userData?.id">
              <div class="w-full flex flex-col justify-center items-start">
                <div class="w-full flex justify-center items-center gap-2">
                  <img
                    :src="userData?.img ?? ''"
                    alt=""
                    width="14"
                    height="14"
                    class="w-14 h-14 min-w-14 min-h-14 object-cover rounded-full"
                  />

                  <div class="w-full flex flex-col justify-center items-start gap-0">
                    <div class="text-xl">{{ userData?.name }}</div>
                    <div
                      :class="
                        computedRating == 'This user has not been rated yet'
                          ? 'w-full flex flex-col  justify-start items-center gap-2'
                          : 'w-full flex  justify-start items-center gap-2'
                      "
                    >
                      <div
                        :class="
                          computedRating == 'This user has not been rated yet'
                            ? 'text-gray-800 text-md font-semibold'
                            : 'text-gray-800'
                        "
                      >
                        {{ computedRating }}
                      </div>
                      <div class="flex justify-start items-center" @click.stop.prevent="">
                        <Icon
                          v-for="(icon, i) in computedStars"
                          :key="i"
                          :icon="icon"
                          width="24"
                          height="24"
                          class="text-yellow-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RouterLink>
          </div>
          <div
            :class="
              isPhone
                ? 'w-[95vw]  flex flex-col justify-center items-center gap-2 bg-white  p-2 rounded-md'
                : 'w-[400px]  flex flex-col justify-center items-center gap-2 bg-white  p-2 rounded-md'
            "
          >
            <Button
              @click="
                (() => {
                  chatStore.onCurrentRoomOpen = true
                  createChatRoom(user.id, ad.user_id ?? '')
                })()
              "
              class="w-full flex items-center p-2 gap-1 text-black bg-white shadow rounded-lg cursor-pointer hover:text-white"
              >Message</Button
            >

            <Button
              @click="onPhoneNumberShow = !onPhoneNumberShow"
              class="w-full p-2 gap-1 text-black bg-white shadow rounded-lg hover:text-white"
              ><div v-if="!onPhoneNumberShow">Phone number</div>
              <div v-else class="w-full break-words whitespace-normal">
                <div v-if="userData?.tel">{{ userData?.tel }}</div>
                <div v-else class="text-sm font-light break-words">
                  This user has not provided a phone number
                </div>
              </div>
            </Button>
          </div>
        </div>
        <button
          @click="[(onDeliveryOpen = !onDeliveryOpen), (ratingStore.id = ad.user_id)]"
          class="w-full flex justify-center items-center gap-2 bg-green-500 px-3 py-1.5 rounded-md"
        >
          <Icon icon="famicons:bag" width="24" height="24" class="text-white" />
          <p class="text-lg text-white font-semibold">Buy now</p>
        </button>
      </div>
    </div>
  </div>
</template>
