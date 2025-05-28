<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { adType } from '@/data/ad-type'
import { defineProps } from 'vue'

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
onMounted(() => {
  console.log(data)
})
</script>
<template>
  <div class="bg-white w-full p-12">
    <div class="flex flex-col items-center w-full">
      <img :src="props.img" alt="" width="150" height="150" class="m-10" />
      <div class="w-full px-4">
        <div class="p-2 rounded">
          <ul class="flex flex-wrap justify-start items-center gap-2">
            <li class="font-semibold text-md">{{ props.title }}:</li>
            <li v-for="item in props.data" :key="item.title" class="break-words">
              {{ item.title }},
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
