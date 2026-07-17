<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ProductGrid from '@/components/ProductGrid.vue'
import { useNotificationStore } from '@/stores/notification'
import { useCartStore } from '@/stores/cart'
import { getCategoryIcon } from '@/utils/categoryIcons'

const router = useRouter()
const notification = useNotificationStore()
const cart = useCartStore()

// ── State ─────────────────────────────────────────────
const products = ref([])
const shops = ref([])
const categories = ref([])
const apiLoading = ref(true)
const apiError = ref('')

// ── Hero carousel ──────────────────────────────────────
const currentSlide = ref(0)
const heroSlides = [
  {
    title: 'Up to 50% Off',
    subtitle: 'Top Electronics & Gadgets',
    description: 'Shop the latest tech at unbeatable prices. Limited time offer.',
    cta: 'Shop Now',
    ctaLink: '/products',
    badge: "Today's Deal",
    accent: '#FF6B35',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
  {
    title: 'Free Delivery',
    subtitle: 'On All Orders Over $50',
    description: 'Fast, reliable shipping from verified sellers across the country.',
    cta: 'Browse Shops',
    ctaLink: '/shops',
    badge: 'Free Shipping',
    accent: '#007185',
    bg: 'linear-gradient(135deg, #0a2342 0%, #126872 50%, #0e4d6a 100%)',
  },
  {
    title: 'New Arrivals',
    subtitle: 'Fresh Products Every Day',
    description: 'Discover the latest products from our verified seller network.',
    cta: 'Explore',
    ctaLink: '/categories',
    badge: 'Just Added',
    accent: '#36D399',
    bg: 'linear-gradient(135deg, #0d2137 0%, #1a3a2a 50%, #0a4d3a 100%)',
  },
]

let carouselTimer = null
const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % heroSlides.length }
const prevSlide = () => { currentSlide.value = (currentSlide.value + heroSlides.length - 1) % heroSlides.length }
const goToSlide = (i) => { currentSlide.value = i }

// ── Computed ───────────────────────────────────────────
const featuredProducts = computed(() => products.value.slice(0, 8))

// ── Methods ────────────────────────────────────────────
const trimText = (text = '', n = 60) => {
  if (!text) return ''
  return text.length > n ? text.substring(0, n) + '…' : text
}

const quickAddToCart = async (product) => {
  try {
    await cart.addToCart(product, 1)
    notification.success('Added to cart!')
  } catch {
    notification.error('Failed to add to cart')
  }
}

const getStars = (rating = 4.2) => Math.round(rating)

// ── Data loading ─────────────────────────────────────
const loadData = async () => {
  apiLoading.value = true
  apiError.value = ''
  const base = import.meta.env.VITE_BACKENDURL

  const [productsRes, shopsRes, categoriesRes] = await Promise.allSettled([
    axios.get(`${base}/main/product/recent`),
    axios.get(`${base}/main/shop/recent`),
    axios.get(`${base}/main/category/all`),
  ])

  if (productsRes.status === 'fulfilled') {
    products.value = Array.isArray(productsRes.value.data)
      ? productsRes.value.data
      : Object.values(productsRes.value.data)
  } else {
    const code = productsRes.reason?.response?.status
    if (code === 503) {
      apiError.value = 'The server database is not yet connected. Content will load automatically once the database is ready.'
    } else {
      apiError.value = productsRes.reason?.response?.data?.message || 'Could not load products.'
    }
  }

  if (shopsRes.status === 'fulfilled') {
    shops.value = Array.isArray(shopsRes.value.data)
      ? shopsRes.value.data
      : Object.values(shopsRes.value.data)
  }

  if (categoriesRes.status === 'fulfilled') {
    categories.value = Array.isArray(categoriesRes.value.data)
      ? categoriesRes.value.data
      : Object.values(categoriesRes.value.data)
  }

  apiLoading.value = false
}

onMounted(() => {
  loadData()
  carouselTimer = setInterval(nextSlide, 5000)
})
onUnmounted(() => clearInterval(carouselTimer))
</script>

<template>
  <div class="min-h-screen" style="background:#EAEDED">

    <!-- ═══════════ HERO CAROUSEL ═══════════ -->
    <section class="relative overflow-hidden select-none" style="background:#131921">
      <div class="relative h-[280px] sm:h-[360px] md:h-[440px]">
        <transition-group name="fade" tag="div">
          <div
            v-for="(slide, i) in heroSlides"
            :key="i"
            v-show="currentSlide === i"
            class="absolute inset-0 flex items-center"
            :style="`background:${slide.bg}`"
          >
            <div class="max-w-screen-xl mx-auto px-6 md:px-12 w-full">
              <div class="max-w-xl">
                <span
                  class="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider"
                  :style="`background:${slide.accent};color:#fff`"
                >{{ slide.badge }}</span>
                <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-3">
                  {{ slide.title }}
                </h1>
                <p class="text-lg sm:text-xl font-semibold mb-2" :style="`color:${slide.accent}`">
                  {{ slide.subtitle }}
                </p>
                <p class="text-sm sm:text-base text-white/70 mb-8">{{ slide.description }}</p>
                <button
                  @click="router.push(slide.ctaLink)"
                  class="btn-cta px-8 py-3 text-base rounded-full font-bold shadow-lg"
                  :style="`background:${slide.accent}`"
                >
                  {{ slide.cta }}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Decorative right side circles -->
            <div class="absolute right-0 top-0 bottom-0 w-1/3 hidden md:flex items-center justify-center overflow-hidden pointer-events-none">
              <div class="w-80 h-80 rounded-full opacity-10" :style="`background:${slide.accent}`"></div>
              <div class="absolute w-48 h-48 rounded-full opacity-20" :style="`background:${slide.accent}`"></div>
            </div>
          </div>
        </transition-group>

        <!-- Arrows -->
        <button @click="prevSlide" class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 transition-colors flex items-center justify-center text-white backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button @click="nextSlide" class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 transition-colors flex items-center justify-center text-white backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>

        <!-- Dots -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <button v-for="(_, i) in heroSlides" :key="i" @click="goToSlide(i)"
            class="h-2 rounded-full transition-all duration-300"
            :class="currentSlide === i ? 'bg-orange-400 w-6' : 'bg-white/40 w-2 hover:bg-white/60'"
          />
        </div>
      </div>
    </section>

    <!-- ═══════════ FEATURES STRIP ═══════════ -->
    <section class="bg-white border-b border-gray-200">
      <div class="max-w-screen-xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
        <div v-for="f in [
          { icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', title: 'Free Shipping', desc: 'On orders over $50', color:'#FF6B35' },
          { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Secure Payment', desc: 'SSL encrypted', color:'#007185' },
          { icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', title: 'Verified Sellers', desc: 'Trusted & authentic', color:'#36D399' },
          { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Easy Returns', desc: '30-day policy', color:'#FFA41C' },
        ]" :key="f.title" class="flex items-center gap-3 px-4 md:px-6 py-3">
          <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0" :style="`background:${f.color}1a`">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" :style="`color:${f.color}`">
              <path stroke-linecap="round" stroke-linejoin="round" :d="f.icon"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-sm text-gray-800">{{ f.title }}</p>
            <p class="text-xs text-gray-500">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ API ERROR BANNER ═══════════ -->
    <div v-if="apiError && !apiLoading" class="max-w-screen-xl mx-auto mt-4 mx-4 px-4">
      <div class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <div>
          <p class="text-sm font-semibold text-amber-800">{{ apiError }}</p>
          <button @click="loadData" class="mt-2 text-xs font-bold px-3 py-1 rounded-full" style="background:#FF6B35;color:#fff">Retry</button>
        </div>
      </div>
    </div>

    <!-- ═══════════ LOADING SKELETON ═══════════ -->
    <div v-if="apiLoading" class="max-w-screen-xl mx-auto px-4 py-8">
      <div class="h-6 w-52 bg-gray-200 rounded-full animate-pulse mb-6"></div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="n in 8" :key="n" class="bg-white rounded-lg overflow-hidden shadow-sm">
          <div class="h-48 bg-gray-200 animate-pulse"></div>
          <div class="p-4 space-y-2">
            <div class="h-3 bg-gray-200 rounded-full animate-pulse"></div>
            <div class="h-3 bg-gray-200 rounded-full animate-pulse w-2/3"></div>
            <div class="h-4 bg-gray-200 rounded-full animate-pulse w-1/3 mt-3"></div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>

      <!-- ═══════════ FEATURED PRODUCTS ═══════════ -->
      <section v-if="featuredProducts.length" class="max-w-screen-xl mx-auto px-4 py-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 class="sh-section-title">Featured Products</h2>
              <p class="text-xs text-gray-500">Hand-picked deals just for you</p>
            </div>
            <router-link to="/products" class="sh-section-link font-semibold flex items-center gap-1">
              See all
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
          <div class="p-5 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="product in featuredProducts"
              :key="product._id"
              class="sh-product-card group cursor-pointer"
              @click="router.push('/product/' + product._id)"
            >
              <div class="relative overflow-hidden">
                <img
                  :src="product.images?.[0] || 'https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image'"
                  :alt="product.name"
                  class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div v-if="product.stock === 0" class="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span class="text-white text-xs font-bold px-2 py-1 bg-red-500 rounded">Out of Stock</span>
                </div>
                <div v-if="product.stock > 0 && product.stock < 10" class="absolute top-2 left-2">
                  <span class="sh-badge-sale">Low Stock</span>
                </div>
              </div>
              <div class="p-3">
                <h3 class="text-sm font-medium text-gray-800 line-clamp-2 mb-1 leading-snug">{{ product.name }}</h3>
                <!-- Stars -->
                <div class="sh-stars text-xs mb-1">
                  <svg v-for="s in 5" :key="s" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" :fill="s <= 4 ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  <span class="text-gray-400 text-[11px] ml-1">({{ Math.floor(Math.random() * 200 + 10) }})</span>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <span class="sh-price">${{ Number(product.price).toFixed(2) }}</span>
                  <button
                    class="text-xs font-semibold px-2 py-1 rounded"
                    style="background:#FF6B35;color:#fff"
                    :disabled="product.stock === 0"
                    @click.stop="quickAddToCart(product)"
                  >+ Cart</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════ CATEGORIES ═══════════ -->
      <section v-if="categories.length" class="max-w-screen-xl mx-auto px-4 py-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 class="sh-section-title">Shop by Category</h2>
            <router-link to="/categories" class="sh-section-link font-semibold flex items-center gap-1">
              All categories
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
          <div class="p-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <router-link
              v-for="cat in categories"
              :key="cat._id"
              :to="'/category/' + cat._id"
              class="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all duration-150 cursor-pointer group"
            >
              <div class="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl group-hover:border-orange-300 transition-colors">
                {{ getCategoryIcon(cat.name) }}
              </div>
              <span class="text-xs font-medium text-center text-gray-700 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">{{ cat.name }}</span>
            </router-link>
          </div>
        </div>
      </section>

      <!-- ═══════════ ALL LATEST PRODUCTS ═══════════ -->
      <section v-if="products.length" class="max-w-screen-xl mx-auto px-4 py-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 class="sh-section-title">Latest Products</h2>
              <p class="text-xs text-gray-500">Freshly added to our marketplace</p>
            </div>
            <router-link to="/products" class="sh-section-link font-semibold flex items-center gap-1">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
          <div class="p-5">
            <ProductGrid :products="products" />
          </div>
        </div>
      </section>

      <!-- ═══════════ FEATURED SHOPS ═══════════ -->
      <section v-if="shops.length" class="max-w-screen-xl mx-auto px-4 py-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 class="sh-section-title">Featured Shops</h2>
              <p class="text-xs text-gray-500">Trusted sellers with great reviews</p>
            </div>
            <router-link to="/shops" class="sh-section-link font-semibold flex items-center gap-1">
              All shops
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
          <div class="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="shop in shops"
              :key="shop._id"
              class="sh-product-card group"
            >
              <div class="h-36 overflow-hidden bg-gray-50">
                <img
                  :src="shop.logo || 'https://placehold.co/600x200/f3f4f6/9ca3af?text=' + shop.name"
                  :alt="shop.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div class="p-4">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-bold text-gray-900 text-base">{{ shop.name }}</h3>
                  <span class="sh-badge-new">Verified</span>
                </div>
                <p class="text-sm text-gray-500 line-clamp-2 mb-3">{{ shop.description }}</p>
                <router-link :to="'/shop/' + shop._id" class="btn-cta w-full text-center block text-sm py-2 rounded-lg">
                  Visit Shop →
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════ EMPTY STATE ═══════════ -->
      <section v-if="!products.length && !categories.length && !shops.length && !apiError" class="max-w-screen-xl mx-auto px-4 py-16">
        <div class="bg-white rounded-lg shadow-sm text-center py-20 px-4">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style="background:#FF6B351a">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#FF6B35" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">No products yet</h2>
          <p class="text-gray-500 mb-6">Be the first seller to add products to ShopHub!</p>
          <router-link to="/register" class="btn-cta px-8 py-3 rounded-full font-bold text-base">Get Started</router-link>
        </div>
      </section>

      <!-- ═══════════ NEWSLETTER ═══════════ -->
      <section class="max-w-screen-xl mx-auto px-4 py-4 pb-8">
        <div class="rounded-xl overflow-hidden relative" style="background:linear-gradient(135deg,#131921 0%,#232F3E 100%)">
          <div class="absolute inset-0 opacity-5">
            <div class="absolute top-0 right-0 w-64 h-64 rounded-full" style="background:#FF6B35;transform:translate(30%,-30%)"></div>
          </div>
          <div class="relative px-6 md:px-12 py-10 md:py-14 max-w-2xl mx-auto text-center">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style="background:#FF6B351a;color:#FF6B35">Newsletter</span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white mb-2">Stay in the Loop</h2>
            <p class="text-sm text-white/70 mb-7">Get exclusive deals, new arrivals, and trending products — straight to your inbox.</p>
            <div class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                class="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-orange-400 text-sm"
              />
              <button class="btn-cta px-6 py-3 rounded-lg font-bold text-sm whitespace-nowrap">Subscribe Free</button>
            </div>
          </div>
        </div>
      </section>

    </template>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.6s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
