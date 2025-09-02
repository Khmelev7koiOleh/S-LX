<script setup lang="ts">
import { Icon } from '@iconify/vue'

import { ref, computed, watch, toRefs } from 'vue'

import { defineEmits } from 'vue'

import { adType } from '@/data/ad-type'
import type { Tables } from '@/types/supabase'
import type { PropType } from 'vue'
import { useWindowSize } from '@/composables/useWindowSize'

const { isPhone, isLaptop, isTablet } = useWindowSize()

const props = defineProps({
  items: { type: Array as PropType<Tables<'ads'>[]>, required: true },
  searchQuery: { type: String, required: true },
  selectedCategory: { type: String, required: false },
})

const { items } = toRefs(props)
const emit = defineEmits(['update:searchQuery', 'update:selectedCategory', 'update:filteredItems'])

const searchQuery = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val),
})

const selectedCategory = computed({
  get: () => props.selectedCategory,
  set: (val) => emit('update:selectedCategory', val),
})

const onFilterOpen = ref<boolean>(false)

const filterCreatedAt = ref<boolean>(false)
const filterPrice = ref<boolean>(false)
const onFilterMenuOpen = ref<boolean>(false)
const filteredItems = computed(() => {
  let result = [...items.value]
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (ad: Tables<'ads'>) =>
        ad?.title?.toLowerCase().includes(query) || ad?.description?.toLowerCase().includes(query),
    )
  }
  if (selectedCategory.value) {
    result = result.filter((ad: Tables<'ads'>) => ad.type === selectedCategory.value)
  }

  if (filterCreatedAt.value) {
    result = result.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  if (filterPrice.value) {
    result = result.sort((a, b) => {
      if (a.price === null) return 1
      if (b.price === null) return -1
      return (b.price as number) - (a.price as number)
    })
  }
  return result
})

const toggleCreatedAtSort = () => {
  filterCreatedAt.value = !filterCreatedAt.value
  filterPrice.value = false
}

const togglePriceSort = () => {
  filterPrice.value = !filterPrice.value
  filterCreatedAt.value = false
}

const filterRemove = () => {
  console.log(filteredItems.value)

  searchQuery.value = ''
  selectedCategory.value = ''
  filterCreatedAt.value = false
  filterPrice.value = false
}

watch(searchQuery, (newQuery) => {
  if (newQuery) {
  }
})
watch(filteredItems, (newVal) => {
  emit('update:filteredItems', newVal)
})
</script>

<template>
  <div class="bg-gray-50">
    <div class="w-full flex flex-col justify-start items-end gap-2 px-4 py-12">
      >

      <div class="w-full flex justify-center items-center gap-2">
        <div
          :class="
            searchQuery?.length
              ? 'w-[300px]  flex justify-between text-gray-900 placeholder:text-amber-100 px-2 py-2 rounded-sm shadow shadow-blue-400'
              : 'w-[300px] flex justify-between text-gray-900 placeholder:text-amber-100 px-2 py-2 rounded-sm shadow shadow-gray-400'
          "
        >
          <Icon
            icon="mdi:magnify"
            width="24"
            height="24"
            :class="searchQuery?.length ? 'text-blue-400' : 'text-gray-900'"
          />
          <input
            placeholder="Search"
            type="text"
            v-model="searchQuery"
            :class="
              onFilterOpen
                ? ' focus:outline-none focus:ring-0 '
                : ' focus:outline-none focus:ring-0 '
            "
          />
        </div>
        <div
          :class="
            isPhone
              ? 'relative w-[50px] flex items-center justify-center'
              : 'relative w-fit flex items-center justify-center '
          "
        >
          <button
            @click="onFilterMenuOpen = !onFilterMenuOpen"
            v-if="isPhone || isTablet"
            class="shadow shadow-gray-400 rounded-full p-2"
          >
            <Icon
              icon="mdi:filter"
              width="24"
              height="24"
              :class="isPhone && onFilterMenuOpen ? ' z-10' : ''"
            />
          </button>
          <div
            v-if="isLaptop || (isPhone && onFilterMenuOpen)"
            :class="
              isPhone && onFilterMenuOpen
                ? 'absolute top-full center-0  max-w-[100px] flex flex-col justify-center items-center gap-0 bg-gray-100 rounded-sm z-10 m-2  '
                : 'w-full flex justify-center items-center gap-4'
            "
          >
            <select
              v-model="selectedCategory"
              :class="
                selectedCategory
                  ? isPhone
                    ? 'w-[100px] h-[40px] flex justify-center items-center shadow shadow-blue-400 rounded-t-sm text-gray-900  placeholder:text-amber-100 text-center  hover:bg-gray-200 focus:bg-gray-200 cursor-pointer '
                    : 'w-[250px] h-[40px] flex justify-center items-center shadow shadow-blue-400 text-gray-900 placeholder:text-amber-100 text-center  hover:bg-gray-200 cursor-pointer '
                  : isPhone
                    ? 'w-[100px] h-[40px] flex justify-center items-center shadow shadow-gray-400 rounded-t-sm text-gray-900 placeholder:text-amber-10 text-center hover:bg-gray-200 focus:bg-gray-200 cursor-pointer '
                    : 'w-[250px] h-[40px] flex justify-center items-center shadow  shadow-gray-400 text-gray-900 placeholder:text-amber-100 text-center hover:bg-gray-200 cursor-pointer '
              "
            >
              <option disabled value="">Type</option>
              <option v-for="type in adType" :key="type.value" :value="type.value">
                {{ type.title }}
              </option>
            </select>
            <div>
              <button
                :class="
                  filterCreatedAt
                    ? isPhone
                      ? 'w-[100px] h-[40px] flex justify-center items-center shadow shadow-blue-400 text-gray-900 placeholder:text-amber-100 text-center rounded-t-sm hover:bg-gray-200 focus:bg-gray-200 cursor-pointer '
                      : 'w-[250px] h-[40px] flex justify-center items-center shadow shadow-blue-400 text-gray-900 placeholder:text-amber-100 text-center  hover:bg-gray-200 cursor-pointer '
                    : isPhone
                      ? 'w-[100px] h-[40px] flex justify-center items-center shadow shadow-gray-400 text-gray-900 placeholder:text-amber-10 text-center hover:bg-gray-200 focus:bg-gray-200 cursor-pointer '
                      : 'w-[250px] h-[40px] flex justify-center items-center shadow  shadow-gray-400 text-gray-900 placeholder:text-amber-100 text-center hover:bg-gray-200 cursor-pointer '
                "
                @click="toggleCreatedAtSort"
              >
                Date
              </button>
            </div>
            <div>
              <button
                :class="
                  filterPrice
                    ? isPhone
                      ? 'w-[100px] h-[40px] flex justify-center items-center shadow shadow-blue-400 text-gray-900 placeholder:text-amber-100 text-center rounded-t-sm hover:bg-gray-200 focus:bg-gray-200 cursor-pointer '
                      : 'w-[250px] h-[40px] flex justify-center items-center shadow shadow-blue-400 text-gray-900 placeholder:text-amber-100 text-center  hover:bg-gray-200 cursor-pointer '
                    : isPhone
                      ? 'w-[100px] h-[40px] flex justify-center items-center shadow shadow-gray-400 text-gray-900 placeholder:text-amber-10 text-center hover:bg-gray-200 focus:bg-gray-200 cursor-pointer '
                      : 'w-[250px] h-[40px] flex justify-center items-center shadow  shadow-gray-400 text-gray-900 placeholder:text-amber-100 text-center hover:bg-gray-200 cursor-pointer '
                "
                @click="togglePriceSort"
              >
                Price
              </button>
            </div>

            <div>
              <button
                :disabled="
                  searchQuery == '' &&
                  selectedCategory == '' &&
                  filterCreatedAt == false &&
                  filterPrice == false
                "
                :class="
                  isPhone
                    ? 'w-[100px] h-[40px] flex justify-center items-center shadow shadow-gray-400 text-gray-900 text-center placeholder:text-amber-100  focus:bg-gray-200 rounded-b-sm cursor-pointer '
                    : 'w-[250px] h-[40px] flex justify-center items-center shadow shadow-gray-400 text-gray-900 text-center placeholder:text-amber-100 hover:bg-gray-200  cursor-pointer '
                "
                @click="filterRemove"
              >
                <p
                  :class="
                    searchQuery == '' &&
                    selectedCategory == '' &&
                    filterCreatedAt == false &&
                    filterPrice == false
                      ? 'text-gray-300'
                      : 'text-gray-900'
                  "
                >
                  Reset
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
