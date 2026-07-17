<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const notification = useNotificationStore()

// State
const product = ref({})
const loading = ref(true)
const error = ref(null)
const quantity = ref(1)
const selectedImage = ref(0)
const reviews = ref([])
const activeTab = ref('description')
const addingToCart = ref(false)

// Mock reviews
const mockReviews = [
  { id: 1, user: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', rating: 5, date: '2024-05-15', comment: 'Excellent product! Exactly as described. Fast shipping and great quality. Highly recommend to anyone looking for this item.', helpful: 12, verified: true },
  { id: 2, user: 'Sarah Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', rating: 4, date: '2024-05-10', comment: 'Good quality product. Delivery was a bit slow but the item itself is great. Would buy again.', helpful: 8, verified: true },
  { id: 3, user: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', rating: 5, date: '2024-05-05', comment: 'Amazing! Better than expected. The seller was very responsive and helpful. Five stars!', helpful: 15, verified: false },
]

// Computed
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

const ratingDistribution = computed(() => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.value.forEach(r => { dist[r.rating]++ })
  return dist
})

const isOutOfStock = computed(() => product.value.stock === 0)
const canAddToCart = computed(() => !isOutOfStock.value && quantity.value > 0 && quantity.value <= product.value.stock)
const totalPrice = computed(() => (product.value.price * quantity.value).toFixed(2))

// Methods
const loadProduct = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'get',
      url: 'main/product/show',
      params: { productID: route.params.productID },
    })
    product.value = response.data
    reviews.value = mockReviews
  } catch (err) {
    console.error('Error loading product:', err)
    error.value = 'Failed to load product details'
    notification.error('Failed to load product')
  } finally {
    loading.value = false
  }
}

const incrementQuantity = () => { if (quantity.value < product.value.stock) quantity.value++ }
const decrementQuantity = () => { if (quantity.value > 1) quantity.value-- }
const selectImage = (index) => { selectedImage.value = index }

const addToCart = async () => {
  if (!canAddToCart.value) return
  addingToCart.value = true
  try {
    await cart.addToCart(product.value, quantity.value)
    notification.success(`Added ${quantity.value} item(s) to cart!`)
    quantity.value = 1
  } catch (err) {
    notification.error('Failed to add to cart')
  } finally {
    addingToCart.value = false
  }
}

const buyNow = async () => {
  if (!canAddToCart.value) return
  try {
    await cart.addToCart(product.value, quantity.value)
    router.push('/checkout')
  } catch (err) {
    notification.error('Failed to proceed to checkout')
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(() => { loadProduct() })
</script>

<template>
  <div class="min-h-screen" style="background:#EAEDED">

    <!-- ── Loading ── -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style="border-color:#FF6B35;border-top-color:transparent"></div>
        <p class="text-gray-500 text-sm">Loading product details...</p>
      </div>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center bg-white rounded-xl p-10 shadow-sm max-w-sm mx-4">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p class="text-gray-500 text-sm mb-6">{{ error }}</p>
        <button @click="router.push('/')" class="btn-cta px-6 py-2.5 rounded-lg">Back to Home</button>
      </div>
    </div>

    <!-- ── Product Detail ── -->
    <div v-else class="max-w-screen-xl mx-auto px-4 py-6">

      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-500 mb-5 flex items-center gap-2">
        <router-link to="/" class="sh-link">Home</router-link>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <router-link to="/products" class="sh-link">Products</router-link>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span class="text-gray-700 font-medium truncate max-w-xs">{{ product.name }}</span>
      </nav>

      <!-- Main grid -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_1fr_300px] gap-5">

        <!-- ── Image Gallery ── -->
        <div class="space-y-3">
          <div class="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <img
              :src="product.images?.[selectedImage] || 'https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image'"
              :alt="product.name"
              class="w-full aspect-square object-contain p-4"
            />
          </div>
          <div v-if="product.images && product.images.length > 1" class="grid grid-cols-5 gap-2">
            <button
              v-for="(image, index) in product.images"
              :key="index"
              @click="selectImage(index)"
              class="border-2 rounded-lg overflow-hidden aspect-square transition-all"
              :style="selectedImage === index ? 'border-color:#FF6B35' : 'border-color:#e5e7eb'"
            >
              <img :src="image" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- ── Product Info ── -->
        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <!-- Title -->
            <h1 class="text-2xl font-bold text-gray-900 leading-snug mb-3">{{ product.name }}</h1>

            <!-- Rating -->
            <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div class="flex items-center gap-1" style="color:#FFA41C">
                <svg v-for="s in 5" :key="s" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" :fill="s <= Math.round(averageRating) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
                <span class="text-sm font-semibold ml-1" style="color:#FFA41C">{{ averageRating }}</span>
              </div>
              <span class="sh-link text-sm">{{ reviews.length }} ratings</span>
              <span v-if="product.stock > 0" class="text-xs font-bold px-2 py-0.5 rounded-full text-green-700 bg-green-50">In Stock</span>
              <span v-else class="text-xs font-bold px-2 py-0.5 rounded-full text-red-700 bg-red-50">Out of Stock</span>
            </div>

            <!-- Price -->
            <div class="py-4 border-b border-gray-100">
              <div class="flex items-baseline gap-3">
                <span class="sh-price-lg">${{ Number(product.price).toFixed(2) }}</span>
                <span v-if="quantity > 1" class="text-sm text-gray-500">Total: ${{ totalPrice }}</span>
              </div>
              <div v-if="product.stock < 10 && product.stock > 0" class="mt-2 flex items-center gap-1.5 text-amber-600 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Only {{ product.stock }} left in stock – order soon!
              </div>
            </div>

            <!-- Description snippet -->
            <div class="py-4 border-b border-gray-100 text-sm text-gray-600 leading-relaxed">
              {{ product.description }}
            </div>

            <!-- Features -->
            <div class="py-3 space-y-2">
              <div v-for="f in ['Free shipping on orders over $50','30-day return policy','Secure payment guaranteed','From a verified seller']" :key="f" class="flex items-center gap-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#36D399" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {{ f }}
              </div>
            </div>
          </div>

          <!-- Tabs Section -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="flex border-b border-gray-100">
              <button v-for="tab in [{id:'description',label:'Description'},{id:'reviews',label:`Reviews (${reviews.length})`},{id:'shipping',label:'Shipping'}]" :key="tab.id"
                @click="activeTab = tab.id"
                class="flex-1 px-4 py-3 text-sm font-semibold transition-all"
                :style="activeTab === tab.id ? 'color:#FF6B35;border-bottom:2px solid #FF6B35;background:#fff7f4' : 'color:#6b7280'"
              >{{ tab.label }}</button>
            </div>
            <div class="p-5">
              <!-- Description -->
              <div v-if="activeTab === 'description'" class="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>{{ product.description }}</p>
                <div class="mt-4 space-y-2">
                  <h4 class="font-bold text-gray-800">Specifications</h4>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="bg-gray-50 rounded-lg p-2"><span class="text-gray-400">SKU</span><p class="font-medium text-gray-700 truncate">{{ product._id }}</p></div>
                    <div class="bg-gray-50 rounded-lg p-2"><span class="text-gray-400">Category</span><p class="font-medium text-gray-700">{{ product.category || 'General' }}</p></div>
                    <div class="bg-gray-50 rounded-lg p-2"><span class="text-gray-400">Stock</span><p class="font-medium text-gray-700">{{ product.stock }} units</p></div>
                    <div class="bg-gray-50 rounded-lg p-2"><span class="text-gray-400">Condition</span><p class="font-medium text-gray-700">New</p></div>
                  </div>
                </div>
              </div>

              <!-- Reviews -->
              <div v-if="activeTab === 'reviews'" class="space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-gray-50 rounded-xl p-5 text-center">
                    <div class="text-5xl font-extrabold mb-1" style="color:#FFA41C">{{ averageRating }}</div>
                    <div class="flex justify-center gap-0.5 mb-2" style="color:#FFA41C">
                      <svg v-for="s in 5" :key="s" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :fill="s <= Math.round(averageRating) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                      </svg>
                    </div>
                    <p class="text-sm text-gray-500">Based on {{ reviews.length }} reviews</p>
                  </div>
                  <div class="space-y-2">
                    <div v-for="rating in [5,4,3,2,1]" :key="rating" class="flex items-center gap-2">
                      <span class="text-xs w-6 text-right text-gray-600">{{ rating }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="#FFA41C" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                      <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full rounded-full" style="background:#FFA41C" :style="`width:${reviews.length ? (ratingDistribution[rating]/reviews.length)*100 : 0}%`"></div>
                      </div>
                      <span class="text-xs text-gray-400 w-4">{{ ratingDistribution[rating] }}</span>
                    </div>
                  </div>
                </div>
                <div class="space-y-4">
                  <div v-for="review in reviews" :key="review.id" class="border border-gray-100 rounded-xl p-4">
                    <div class="flex items-start gap-3">
                      <img :src="review.avatar" :alt="review.user" class="w-10 h-10 rounded-full shrink-0"/>
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-semibold text-sm text-gray-800">{{ review.user }}</span>
                          <span v-if="review.verified" class="sh-badge-new text-[10px]">Verified</span>
                        </div>
                        <div class="flex gap-0.5 mb-2" style="color:#FFA41C">
                          <svg v-for="s in 5" :key="s" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" :fill="s <= review.rating ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                          </svg>
                        </div>
                        <p class="text-sm text-gray-600">{{ review.comment }}</p>
                        <p class="text-xs text-gray-400 mt-2">{{ formatDate(review.date) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Shipping -->
              <div v-if="activeTab === 'shipping'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="border border-gray-100 rounded-xl p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center" style="background:#FF6B351a">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#FF6B35" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                      </div>
                      <h4 class="font-bold text-gray-800">Standard Shipping</h4>
                    </div>
                    <p class="text-sm text-gray-500">5–7 business days</p>
                    <p class="text-xl font-bold mt-1" style="color:#B12704">$5.99</p>
                  </div>
                  <div class="border border-orange-100 rounded-xl p-4" style="background:#fff7f4">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center" style="background:#FF6B351a">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#FF6B35" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      </div>
                      <h4 class="font-bold text-gray-800">Express Shipping</h4>
                    </div>
                    <p class="text-sm text-gray-500">2–3 business days</p>
                    <p class="text-xl font-bold mt-1" style="color:#B12704">$12.99</p>
                  </div>
                </div>
                <div class="text-sm text-gray-600 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  Free shipping on orders over $50! Add more items to qualify.
                </div>
                <div class="text-sm text-gray-600 border border-gray-100 rounded-xl p-4">
                  <h4 class="font-bold text-gray-800 mb-2">Return Policy</h4>
                  <p>We offer a 30-day return policy for all products. Items must be unused and in original packaging. Contact us within 30 days of delivery to initiate a return.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Sticky Buy Box (Amazon-style right column) ── -->
        <div class="lg:block">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-24 space-y-4">
            <div>
              <span class="sh-price-lg">${{ Number(product.price).toFixed(2) }}</span>
            </div>

            <!-- Availability -->
            <div class="text-sm">
              <span class="text-gray-600">Availability: </span>
              <span v-if="product.stock > 0" class="font-semibold" style="color:#007600">In Stock</span>
              <span v-else class="font-semibold text-red-600">Out of Stock</span>
            </div>

            <!-- Low stock warning -->
            <div v-if="product.stock < 10 && product.stock > 0" class="text-xs text-red-600 font-medium">
              Only {{ product.stock }} left — order soon!
            </div>

            <!-- Quantity -->
            <div>
              <label class="text-sm font-semibold text-gray-700 block mb-2">Quantity</label>
              <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit">
                <button @click="decrementQuantity" :disabled="quantity <= 1" class="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-lg leading-none">−</button>
                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  :max="product.stock"
                  class="w-12 text-center text-sm font-bold border-x border-gray-200 py-2 bg-white"
                  :disabled="isOutOfStock"
                />
                <button @click="incrementQuantity" :disabled="quantity >= product.stock" class="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-lg leading-none">+</button>
              </div>
              <p class="text-xs text-gray-400 mt-1">{{ product.stock }} available</p>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-2">
              <button
                @click="addToCart"
                :disabled="!canAddToCart || addingToCart"
                class="btn-cta w-full py-3 rounded-full font-bold text-sm"
                :class="{ 'opacity-60 cursor-not-allowed': !canAddToCart || addingToCart }"
              >
                <svg v-if="addingToCart" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isOutOfStock ? 'Out of Stock' : 'Add to Cart' }}
              </button>
              <button
                @click="buyNow"
                :disabled="!canAddToCart"
                class="w-full py-3 rounded-full font-bold text-sm border-2 transition-all"
                style="border-color:#FF6B35;color:#FF6B35"
                :class="{ 'opacity-60 cursor-not-allowed': !canAddToCart }"
              >
                Buy Now
              </button>
            </div>

            <!-- Trust -->
            <div class="pt-3 border-t border-gray-100 space-y-2">
              <div v-for="t in [
                {icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',label:'Secure Transaction'},
                {icon:'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',label:'30-Day Returns'},
                {icon:'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',label:'Ships from ShopHub'},
              ]" :key="t.label" class="flex items-center gap-2 text-xs text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#36D399" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="t.icon"/>
                </svg>
                {{ t.label }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }
</style>
