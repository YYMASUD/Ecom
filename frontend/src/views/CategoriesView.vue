<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getCategoryIcon } from '@/utils/categoryIcons'

const categories = ref([])
const loading    = ref(true)

const base = import.meta.env.VITE_BACKENDURL

onMounted(async () => {
  try {
    const res = await axios.get(`${base}/main/category/all`)
    categories.value = Array.isArray(res.data) ? res.data : Object.values(res.data)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

// Sample images pulled from the products array embedded in category (if populated)
const sampleImages = (cat) =>
  (cat.products || [])
    .slice(0, 4)
    .map(p => (typeof p === 'object' ? p.images?.[0] : null))
    .filter(Boolean)
</script>

<template>
  <div class="min-h-screen" style="background:#EAEDED">
    <div class="max-w-screen-xl mx-auto px-4 py-6">

      <!-- Header -->
      <div class="mb-5">
        <h1 class="text-2xl font-bold text-gray-900">Shop by Category</h1>
        <p class="text-sm text-gray-500 mt-1">Browse all {{ categories.length }} categories</p>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div v-for="n in 10" :key="n" class="bg-white rounded-xl h-44 animate-pulse border border-gray-100 shadow-sm"></div>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <router-link
          v-for="cat in categories"
          :key="cat._id"
          :to="`/category/${cat._id}`"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group"
        >
          <!-- Icon / Image area -->
          <div class="h-28 flex items-center justify-center bg-gray-50 border-b border-gray-100 relative overflow-hidden">
            <!-- Show grid of product images if available, otherwise big emoji -->
            <template v-if="sampleImages(cat).length >= 4">
              <div class="grid grid-cols-2 w-full h-full">
                <img
                  v-for="(img, j) in sampleImages(cat)"
                  :key="j"
                  :src="img"
                  :alt="cat.name"
                  class="w-full h-full object-cover"
                />
              </div>
            </template>
            <span v-else class="text-5xl group-hover:scale-110 transition-transform duration-200 select-none">
              {{ getCategoryIcon(cat.name) }}
            </span>

            <!-- Product count badge -->
            <div
              v-if="cat.productCount > 0"
              class="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style="background:#FF6B35;color:#fff"
            >
              {{ cat.productCount }}
            </div>
          </div>

          <!-- Label -->
          <div class="px-3 py-2.5">
            <h3 class="font-semibold text-sm text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">
              {{ cat.name }}
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ cat.productCount || 0 }} product{{ cat.productCount !== 1 ? 's' : '' }}
            </p>
          </div>
        </router-link>
      </div>

    </div>
  </div>
</template>
