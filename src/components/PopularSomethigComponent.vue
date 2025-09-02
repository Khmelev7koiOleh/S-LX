<script setup lang="ts">
import { toRefs, onMounted } from 'vue'

import { defineProps } from 'vue'
import { useGetAdCategory } from '../composables/get-ad-category'

import { useWindowSize } from '@/composables/useWindowSize'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion'

const { isPhone, isLaptop } = useWindowSize()

const { getValueOf } = useGetAdCategory()

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  data: {
    type: Array<{ title: string; value: string }>,
    required: true,
  },
})
const { data } = toRefs(props)

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
        ? 'bg-white w-full flex justify-center items- gap-2 px-1 pb-4'
        : 'bg-white w-full flex justify-center items- gap-2 px-10 pb-6'
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
              :key="item?.title"
              :class="isPhone ? 'w-full flex justify-start items-center' : 'self-start'"
              class="break-words"
            >
              <button @click="handleCategory(item?.value)" class="hover:underline hover:scale-110">
                {{ item?.title }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
