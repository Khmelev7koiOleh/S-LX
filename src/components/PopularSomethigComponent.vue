<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { adType } from '@/data/ad-type'
import { defineProps } from 'vue'
import { useGetAdCategory } from '../composables/get-ad-category'
import { useFilterStore } from '../stores/filter-store'
import { useWindowSize } from '@/composables/useWindowSize'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion'

const { width, height, isPhone, isTablet, isLaptop } = useWindowSize()

const { getValueOf } = useGetAdCategory()
const filterStore = useFilterStore()
const { selectedCategory } = toRefs(filterStore)
const router = useRouter()
const props = defineProps({
  img: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
})
const { img, title, data } = toRefs(props)
// const mediaIcons = ref([
//   {
//     icon: 'mdi:facebook',
//     width: '34',
//     height: '34',
//   },
//   {
//     icon: 'mdi:instagram',
//     width: '34',
//     height: '34',
//   },
//   {
//     icon: 'mdi:twitter',
//     width: '34',
//     height: '34',
//   },
// ])
// const getValueOff = (ref: string) => {
//   console.log(ref)
//   selectedCategory.value = ref
//   router.push(`/about/`)
// }
const handleCategory = (category: string) => {
  getValueOf(category)
}
onMounted(() => {
  console.log(data)
})
</script>
<template>
  <div
    :class="
      isPhone
        ? 'bg-white w-full flex justify-center items- gap-2 px-1'
        : 'bg-white w-full flex justify-center items- gap-2 px-10'
    "
  >
    <div class="flex flex-col items-center w-full">
      <img :src="props.img" alt="" width="150" height="150" class="m-10" />
      <div class="w-full flex justify-center items-center">
        <div class="w-full p-2 rounded">
          <Accordion v-if="isPhone" type="single" class="w-full" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger
                ><p class="font-semibold text-md">{{ props.title }}:</p></AccordionTrigger
              >
              <AccordionContent v-for="item in props.data" :key="item.title">
                <button @click="handleCategory(item.value)" class="hover:underline hover:scale-110">
                  {{ item.title }}
                </button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <ul v-if="isLaptop" class="flex flex-wrap justify-between items-center gap-1">
            <li class="font-semibold text-lg">{{ props.title }}:</li>
            <li
              v-for="item in props.data"
              :key="item.title"
              :class="isPhone ? 'w-full flex justify-start items-center' : 'self-start'"
              class="break-words"
            >
              <button @click="handleCategory(item.value)" class="hover:underline hover:scale-110">
                {{ item.title }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
