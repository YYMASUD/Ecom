<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// State
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const showDropdown = ref(false)
const selectedIndex = ref(-1)
const searchInput = ref(null)

// Debounce timer
let debounceTimer = null

// Computed
const hasResults = computed(() => searchResults.value.length > 0)

// Methods
const searchProducts = async (query) => {
  if (!query || query.trim().length < 2) {
    searchResults.value = []
    showDropdown.value = false
    return
  }

  isSearching.value = true

  try {
    const response = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'get',
      url: 'main/product/search',
      params: {
        q: query.trim(),
        limit: 8
      }
    })

    searchResults.value = response.data || []
    showDropdown.value = searchResults.value.length > 0
  } catch (error) {
    console.error('Search error:', error)
    // If search endpoint doesn't exist, try getting all products and filter
    try {
      const response = await axios({
        baseURL: import.meta.env.VITE_BACKENDURL,
        method: 'get',
        url: 'main/product/recent'
      })
      
      const products = Object.values(response.data || {})
      const lowerQuery = query.toLowerCase()
      
      searchResults.value = products.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description?.toLowerCase().includes(lowerQuery)
      ).slice(0, 8)
      
      showDropdown.value = searchResults.value.length > 0
    } catch (fallbackError) {
      console.error('Fallback search error:', fallbackError)
      searchResults.value = []
      showDropdown.value = false
    }
  } finally {
    isSearching.value = false
  }
}

const handleInput = () => {
  // Clear previous timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Set new timer for debounced search
  debounceTimer = setTimeout(() => {
    searchProducts(searchQuery.value)
  }, 300)
}

const selectResult = (product) => {
  router.push(`/product/${product._id}`)
  clearSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showDropdown.value = false
  selectedIndex.value = -1
}

const handleKeydown = (event) => {
  if (!showDropdown.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && selectedIndex.value < searchResults.value.length) {
        selectResult(searchResults.value[selectedIndex.value])
      } else if (searchQuery.value.trim()) {
        performFullSearch()
      }
      break
    case 'Escape':
      clearSearch()
      searchInput.value?.blur()
      break
  }
}

const performFullSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    })
    clearSearch()
  }
}

const handleClickOutside = (event) => {
  const searchContainer = event.target.closest('.search-container')
  if (!searchContainer) {
    showDropdown.value = false
    selectedIndex.value = -1
  }
}

const trimText = (text, length = 50) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

// Watch for route changes to clear search
watch(() => router.currentRoute.value, () => {
  clearSearch()
})
</script>

<template>
  <div class="search-container relative w-full max-w-lg">
    <div class="form-control">
      <div class="input-group">
        <input
          ref="searchInput"
          v-model="searchQuery"
          @input="handleInput"
          @keydown="handleKeydown"
          @focus="searchQuery && searchProducts(searchQuery)"
          type="text"
          placeholder="Search products..."
          class="input input-bordered w-full"
        />
        <button
          @click="performFullSearch"
          class="btn btn-square btn-primary"
          :disabled="!searchQuery.trim()"
        >
          <svg
            v-if="!isSearching"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span v-else class="loading loading-spinner loading-sm"></span>
        </button>
      </div>
    </div>

    <!-- Autocomplete Dropdown -->
    <div
      v-if="showDropdown"
      class="absolute z-50 w-full mt-2 bg-base-100 shadow-2xl rounded-lg max-h-96 overflow-y-auto"
    >
      <!-- Loading State -->
      <div v-if="isSearching" class="p-4 text-center">
        <span class="loading loading-spinner loading-md text-primary"></span>
        <p class="text-sm text-base-content/70 mt-2">Searching...</p>
      </div>

      <!-- Results -->
      <div v-else-if="hasResults" class="py-2">
        <div
          v-for="(product, index) in searchResults"
          :key="product._id"
          @click="selectResult(product)"
          @mouseenter="selectedIndex = index"
          :class="[
            'flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors',
            selectedIndex === index ? 'bg-primary/10' : 'hover:bg-base-200'
          ]"
        >
          <div class="avatar">
            <div class="w-12 h-12 rounded">
              <img
                :src="product.images?.[0] || 'https://via.placeholder.com/100'"
                :alt="product.name"
                class="object-cover"
              />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-sm truncate">{{ product.name }}</h4>
            <p class="text-xs text-base-content/70 truncate">
              {{ trimText(product.description, 60) }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-sm font-bold text-primary">${{ product.price }}</span>
              <span
                v-if="product.stock > 0"
                class="badge badge-success badge-xs"
              >
                In Stock
              </span>
              <span v-else class="badge badge-error badge-xs">Out of Stock</span>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-base-content/30"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- View All Results -->
        <div class="border-t border-base-300 mt-2">
          <button
            @click="performFullSearch"
            class="w-full px-4 py-3 text-sm text-primary hover:bg-base-200 transition-colors text-center font-semibold"
          >
            View all results for "{{ searchQuery }}"
          </button>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="p-8 text-center">
        <div class="text-4xl mb-2">🔍</div>
        <p class="font-semibold mb-1">No products found</p>
        <p class="text-sm text-base-content/70">
          Try searching with different keywords
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
}

/* Custom scrollbar for dropdown */
.search-container > div:last-child::-webkit-scrollbar {
  width: 8px;
}

.search-container > div:last-child::-webkit-scrollbar-track {
  background: transparent;
}

.search-container > div:last-child::-webkit-scrollbar-thumb {
  background: hsl(var(--bc) / 0.2);
  border-radius: 4px;
}

.search-container > div:last-child::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--bc) / 0.3);
}
</style>