<template>
  <div class="bg-[#032b21] mt-2 p-2">
    <div class="flex justify-center items-center gap-4">
      <div>
        <img
          src="https://www.olx.ua/app/static/media/graph.49012f6ae.svg"
          alt=""
          width="150"
          height="150"
        />
      </div>
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-2 mx-4">
        <div class="flex flex-col justify-start items-start gap-2 mx-4">
          <p class="max-w-[100%] font-cursive text-start text-white text-md">
            Stand out as a company!
          </p>
          <p class="max-w-[100%] font-semibold text-start text-white text-xl">
            Check out OLX's offer for businesses
          </p>
        </div>
        <button
          @click="handleCategory('business')"
          class="w-full md:w-fit text-md text-black bg-white px-3 py-1.5 md:py-2 rounded-md font-semibold"
        >
          More Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGetAdCategory } from '../composables/get-ad-category'

const { getValueOf } = useGetAdCategory()
const handleCategory = (category: string) => {
  getValueOf(category)
}
</script>

<style scoped></style>
