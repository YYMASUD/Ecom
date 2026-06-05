<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ProductGrid from '@/components/ProductGrid.vue'
import { useNotificationStore } from '@/stores/notification'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const notification = useNotificationStore()
const cart = useCartStore()

// State
const products = ref([])
const featuredProducts = ref([])
const shops = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)

// Hero carousel state
const currentSlide = ref(0)
const heroSlides = [
  {
    title: 'Welcome to Our Marketplace',
    subtitle: 'Discover Amazing Products from Top Sellers',
    description: 'Shop from thousands of products across multiple categories with secure checkout and fast delivery.',
    cta: 'Start Shopping',
    ctaLink: '/category/all',
    bgGradient: 'from-primary to-secondary'
  },
  {
    title: 'Quality You Can Trust',
    subtitle: 'Verified Sellers & Authentic Products',
    description: 'Every seller is verified and every product is guaranteed authentic. Shop with confidence.',
    cta: 'Browse Shops',
    ctaLink: '/shops',
    bgGradient: 'from-accent to-info'
  },
  {
    title: 'Fast & Secure Delivery',
    subtitle: 'Track Your Orders in Real-Time',
    description: 'Get your orders delivered quickly with real-time tracking and secure payment options.',
    cta: 'Learn More',
    ctaLink: '/about',
    bgGradient: 'from-success to-warning'
  }
]

// Computed
const hasProducts = computed(() => products.value && Object.keys(products.value).length > 0)
const hasShops = computed(() => shops.value && Object.keys(shops.value).length > 0)
const hasCategories = computed(() => categories.value && Object.keys(categories.value).length > 0)

// Methods
const trimText = (text = '', n = 20) => {
  if (!text) return ''
  return text.length > n ? text.substring(0, n) + '...' : text
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % heroSlides.length
}

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0 ? heroSlides.length - 1 : currentSlide.value - 1
}

const goToSlide = (index) => {
  currentSlide.value = index
}

const navigateTo = (path) => {
  router.push(path)
}

const quickAddToCart = async (product) => {
  try {
    await cart.addToCart(product, 1)
    notification.success('Added to cart!')
  } catch (err) {
    notification.error('Failed to add to cart')
  }
}

const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    // Load products
    const productsRes = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'get',
      url: 'main/product/recent',
    })
    products.value = productsRes.data

    // Get featured products (first 4)
    const productsArray = Object.values(productsRes.data)
    featuredProducts.value = productsArray.slice(0, 4)

    // Load shops
    const shopsRes = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'get',
      url: 'main/shop/recent',
    })
    shops.value = shopsRes.data

    // Load categories
    const categoriesRes = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'get',
      url: 'main/category/all',
    })
    categories.value = categoriesRes.data

  } catch (err) {
    console.error('Error loading data:', err)
    error.value = 'Failed to load data. Please try again.'
    notification.error('Failed to load homepage data')
  } finally {
    loading.value = false
  }
}

// Auto-advance hero carousel
let carouselInterval
onMounted(() => {
  loadData()
  
  // Auto-advance carousel every 5 seconds
  carouselInterval = setInterval(() => {
    nextSlide()
  }, 5000)
})

// Cleanup
const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
  }
}

// Stop carousel on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  stopCarousel()
})
</script>

<template>
  <main class="min-h-screen">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-4 text-base-content/70">Loading amazing products...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center max-w-md">
        <div class="text-6xl mb-4">😕</div>
        <h2 class="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p class="text-base-content/70 mb-6">{{ error }}</p>
        <button @click="loadData" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          Try Again
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-16 pb-16">
      <!-- Hero Carousel Section -->
      <section class="relative overflow-hidden">
        <div class="carousel w-full h-[500px] md:h-[600px]">
          <div
            v-for="(slide, index) in heroSlides"
            :key="index"
            :class="['carousel-item relative w-full', currentSlide === index ? 'block' : 'hidden']"
          >
            <div :class="['hero min-h-full w-full bg-gradient-to-r', slide.bgGradient]">
              <div class="hero-content text-center text-neutral-content">
                <div class="max-w-3xl px-4">
                  <h1 class="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                    {{ slide.title }}
                  </h1>
                  <h2 class="text-2xl md:text-3xl font-semibold mb-6 opacity-90">
                    {{ slide.subtitle }}
                  </h2>
                  <p class="text-lg md:text-xl mb-8 opacity-80 max-w-2xl mx-auto">
                    {{ slide.description }}
                  </p>
                  <button @click="navigateTo(slide.ctaLink)" class="btn btn-lg btn-neutral">
                    {{ slide.cta }}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Carousel Controls -->
        <div class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
          <button @click="prevSlide" class="btn btn-circle btn-sm md:btn-md glass">❮</button>
          <button @click="nextSlide" class="btn btn-circle btn-sm md:btn-md glass">❯</button>
        </div>

        <!-- Carousel Indicators -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <button
            v-for="(slide, index) in heroSlides"
            :key="index"
            @click="goToSlide(index)"
            :class="['btn btn-xs', currentSlide === index ? 'btn-primary' : 'btn-ghost glass']"
          >
            {{ index + 1 }}
          </button>
        </div>
      </section>

      <!-- Features Section -->
      <section class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div class="card-body items-center text-center">
              <div class="text-5xl mb-4">🚚</div>
              <h3 class="card-title">Fast Delivery</h3>
              <p class="text-base-content/70">Get your orders delivered quickly with real-time tracking</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div class="card-body items-center text-center">
              <div class="text-5xl mb-4">🔒</div>
              <h3 class="card-title">Secure Payment</h3>
              <p class="text-base-content/70">Shop safely with our encrypted payment system</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div class="card-body items-center text-center">
              <div class="text-5xl mb-4">✨</div>
              <h3 class="card-title">Quality Products</h3>
              <p class="text-base-content/70">Verified sellers and authentic products guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Products Section -->
      <section v-if="featuredProducts.length > 0" class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold">Featured Products</h2>
            <p class="text-base-content/70 mt-2">Hand-picked products just for you</p>
          </div>
          <button @click="navigateTo('/products')" class="btn btn-outline btn-primary hidden md:flex">
            View All
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(product, key) in featuredProducts"
            :key="key"
            class="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <figure class="px-4 pt-4">
              <img
                :src="product.images?.[0] || 'https://via.placeholder.com/300'"
                :alt="product.name"
                class="rounded-xl h-48 w-full object-cover"
              />
            </figure>
            <div class="card-body">
              <h3 class="card-title text-lg">
                {{ trimText(product.name, 30) }}
                <div v-if="product.stock < 10" class="badge badge-warning badge-sm">Low Stock</div>
              </h3>
              <p class="text-base-content/70 text-sm">{{ trimText(product.description, 60) }}</p>
              <div class="flex items-center gap-2 mt-2">
                <div class="rating rating-sm">
                  <input type="radio" class="mask mask-star-2 bg-orange-400" disabled checked />
                </div>
                <span class="text-sm text-base-content/70">4.5 (120)</span>
              </div>
              <div class="card-actions justify-between items-center mt-4">
                <div class="text-2xl font-bold text-primary">${{ product.price }}</div>
                <div class="flex gap-2">
                  <button
                    @click="quickAddToCart(product)"
                    class="btn btn-primary btn-sm"
                    :disabled="product.stock === 0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                  </button>
                  <router-link :to="'/product/' + product._id" class="btn btn-ghost btn-sm">
                    View
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-8 md:hidden">
          <button @click="navigateTo('/products')" class="btn btn-outline btn-primary btn-wide">
            View All Products
          </button>
        </div>
      </section>

      <!-- Recent Products Section -->
      <section v-if="hasProducts" class="container mx-auto px-4">
        <div class="mb-8">
          <h2 class="text-3xl md:text-4xl font-bold">Recent Products</h2>
          <p class="text-base-content/70 mt-2">Latest additions to our marketplace</p>
        </div>
        <ProductGrid :products="products" />
      </section>

      <!-- Categories Section -->
      <section v-if="hasCategories" class="bg-base-200 py-16">
        <div class="container mx-auto px-4">
          <div class="mb-8 text-center">
            <h2 class="text-3xl md:text-4xl font-bold">Shop by Category</h2>
            <p class="text-base-content/70 mt-2">Explore our wide range of categories</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <router-link
              v-for="(category, key) in categories"
              :key="key"
              :to="'/category/' + category._id"
              class="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div class="card-body items-center justify-center p-6">
                <div class="text-4xl mb-2">📦</div>
                <h3 class="card-title text-center text-sm">{{ category.name }}</h3>
              </div>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Shops Section -->
      <section v-if="hasShops" class="container mx-auto px-4">
        <div class="mb-8">
          <h2 class="text-3xl md:text-4xl font-bold">Featured Shops</h2>
          <p class="text-base-content/70 mt-2">Discover amazing sellers on our platform</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(shop, key) in shops"
            :key="key"
            class="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <figure class="h-48">
              <img
                :src="shop.logo || 'https://via.placeholder.com/400x200'"
                :alt="shop.name"
                class="w-full h-full object-cover"
              />
            </figure>
            <div class="card-body">
              <h3 class="card-title">
                {{ shop.name }}
                <div class="badge badge-success badge-sm">Verified</div>
              </h3>
              <p class="text-base-content/70">{{ trimText(shop.description, 100) }}</p>
              <div class="flex items-center gap-2 mt-2">
                <div class="rating rating-sm">
                  <input type="radio" class="mask mask-star-2 bg-orange-400" disabled checked />
                </div>
                <span class="text-sm text-base-content/70">4.8 (350 reviews)</span>
              </div>
              <div class="card-actions justify-end mt-4">
                <router-link :to="'/shop/' + shop._id" class="btn btn-primary btn-sm">
                  Visit Shop
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter Section -->
      <section class="bg-primary text-primary-content py-16">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p class="text-lg mb-8 opacity-90">Subscribe to our newsletter for exclusive deals and updates</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              class="input input-bordered flex-1"
            />
            <button class="btn btn-neutral">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}
</style>
