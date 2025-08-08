import { onMounted, ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { useFilterStore } from '../stores/filter-store'

export function useGetAdCategory() {
  const router = useRouter()

  const filterStore = useFilterStore()
  const { selectedCategory } = toRefs(filterStore)
  const getValueOf = (ref: string) => {
    console.log(ref)
    selectedCategory.value = ref
    console.log(selectedCategory.value)
    router.push(`/about/`)
  }

  return {
    getValueOf,
  }
}
