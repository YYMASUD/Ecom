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

// Mock reviews (replace with API call later)
const mockReviews = [
  {
    id: 1,
    user: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    rating: 5,
    date: '2024-05-15',
    comment: 'Excellent product! Exactly as described. Fast shipping and great quality. Highly recommend to anyone looking for this item.',
    helpful: 12,
    verified: true
  },
  {
    id: 2,
    user: 'Sarah Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    rating: 4,
    date: '2024-05-10',
    comment: 'Good quality product. Delivery was a bit slow but the item itself is great. Would buy again.',
    helpful: 8,
    verified: true
  },
  {
    id: 3,
    user: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    rating: 5,
    date: '2024-05-05',
    comment: 'Amazing! Better than expected. The seller was very responsive and helpful. Five stars!',
    helpful: 15,
    verified: false
  }
]

// Computed
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

const ratingDistribution = computed(() => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.value.forEach(review => {
    dist[review.rating]++
  })
  return dist
})

const isOutOfStock = computed(() => product.value.stock === 0)

const canAddToCart = computed(() => {
  return !isOutOfStock.value && quantity.value > 0 && quantity.value <= product.value.stock
})

const totalPrice = computed(() => {
  return (product.value.price * quantity.value).toFixed(2)
})

// Methods
const loadProduct = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'get',
      url: 'main/product/show',
      params: {
        productID: route.params.productID,
      },
    })
    product.value = response.data
    reviews.value = mockReviews // Replace with actual API call
  } catch (err) {
    console.error('Error loading product:', err)
    error.value = 'Failed to load product details'
    notification.error('Failed to load product')
  } finally {
    loading.value = false
  }
}

const incrementQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const selectImage = (index) => {
  selectedImage.value = index
}

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

const getStarArray = (rating) => {
  return Array.from({ length: 5 }, (_, i) => i < rating)
}

onMounted(() => {
  loadProduct()
})
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-4 text-base-content/70">Loading product details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center max-w-md">
        <div class="text-6xl mb-4">😕</div>
        <h2 class="text-2xl font-bold mb-2">Product Not Found</h2>
        <p class="text-base-content/70 mb-6">{{ error }}</p>
        <button @click="router.push('/')" class="btn btn-primary">
          Back to Home
        </button>
      </div>
    </div>

    <!-- Product Details -->
    <div v-else class="space-y-8">
      <!-- Breadcrumb -->
      <div class="text-sm breadcrumbs">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/products">Products</router-link></li>
          <li>{{ product.name }}</li>
        </ul>
      </div>

      <!-- Product Main Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Image Gallery -->
        <div class="space-y-4">
          <!-- Main Image -->
          <div class="card bg-base-100 shadow-xl overflow-hidden">
            <figure class="aspect-square">
              <img
                :src="product.images?.[selectedImage] || 'https://via.placeholder.com/600'"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
            </figure>
          </div>

          <!-- Thumbnail Gallery -->
          <div v-if="product.images && product.images.length > 1" class="grid grid-cols-4 gap-2">
            <button
              v-for="(image, index) in product.images"
              :key="index"
              @click="selectImage(index)"
              :class="[
                'card bg-base-100 shadow-md overflow-hidden cursor-pointer transition-all',
                selectedImage === index ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-base-300'
              ]"
            >
              <figure class="aspect-square">
                <img :src="image" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-cover" />
              </figure>
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Title and Rating -->
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-4">{{ product.name }}</h1>
            <div class="flex items-center gap-4 flex-wrap">
              <div class="flex items-center gap-2">
                <div class="rating rating-sm">
                  <input
                    v-for="star in 5"
                    :key="star"
                    type="radio"
                    class="mask mask-star-2 bg-orange-400"
                    :checked="star <= Math.round(averageRating)"
                    disabled
                  />
                </div>
                <span class="text-base-content/70">{{ averageRating }} ({{ reviews.length }} reviews)</span>
              </div>
              <div v-if="product.stock > 0" class="badge badge-success">In Stock</div>
              <div v-else class="badge badge-error">Out of Stock</div>
            </div>
          </div>

          <!-- Price -->
          <div class="card bg-base-200 p-6">
            <div class="flex items-baseline gap-4">
              <span class="text-4xl font-bold text-primary">${{ product.price }}</span>
              <span v-if="quantity > 1" class="text-xl text-base-content/70">
                Total: ${{ totalPrice }}
              </span>
            </div>
            <div v-if="product.stock < 10 && product.stock > 0" class="text-warning mt-2">
              ⚠️ Only {{ product.stock }} left in stock!
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Quantity</span>
              <span class="label-text-alt">Available: {{ product.stock }}</span>
            </label>
            <div class="join">
              <button
                @click="decrementQuantity"
                class="btn btn-outline join-item"
                :disabled="quantity <= 1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                :max="product.stock"
                class="input input-bordered join-item w-20 text-center"
                :disabled="isOutOfStock"
              />
              <button
                @click="incrementQuantity"
                class="btn btn-outline join-item"
                :disabled="quantity >= product.stock"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="addToCart"
              class="btn btn-primary flex-1"
              :disabled="!canAddToCart || addingToCart"
            >
              <span v-if="addingToCart" class="loading loading-spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {{ isOutOfStock ? 'Out of Stock' : 'Add to Cart' }}
            </button>
            <button
              @click="buyNow"
              class="btn btn-outline btn-primary flex-1"
              :disabled="!canAddToCart"
            >
              Buy Now
            </button>
          </div>

          <!-- Product Features -->
          <div class="card bg-base-100 shadow-md">
            <div class="card-body">
              <h3 class="card-title text-lg">Product Features</h3>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Free shipping on orders over $50</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>30-day return policy</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Secure payment</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Verified seller</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Section -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- Tab Headers -->
          <div class="tabs tabs-boxed bg-base-200">
            <button
              @click="activeTab = 'description'"
              :class="['tab', activeTab === 'description' && 'tab-active']"
            >
              Description
            </button>
            <button
              @click="activeTab = 'reviews'"
              :class="['tab', activeTab === 'reviews' && 'tab-active']"
            >
              Reviews ({{ reviews.length }})
            </button>
            <button
              @click="activeTab = 'shipping'"
              :class="['tab', activeTab === 'shipping' && 'tab-active']"
            >
              Shipping
            </button>
          </div>

          <!-- Tab Content -->
          <div class="mt-6">
            <!-- Description Tab -->
            <div v-if="activeTab === 'description'" class="prose max-w-none">
              <h3>Product Description</h3>
              <p>{{ product.description }}</p>
              <h4>Specifications</h4>
              <ul>
                <li>SKU: {{ product._id }}</li>
                <li>Category: {{ product.category || 'General' }}</li>
                <li>Stock: {{ product.stock }} units available</li>
              </ul>
            </div>

            <!-- Reviews Tab -->
            <div v-if="activeTab === 'reviews'" class="space-y-6">
              <!-- Rating Summary -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="card bg-base-200">
                  <div class="card-body items-center text-center">
                    <div class="text-5xl font-bold text-primary">{{ averageRating }}</div>
                    <div class="rating rating-lg">
                      <input
                        v-for="star in 5"
                        :key="star"
                        type="radio"
                        class="mask mask-star-2 bg-orange-400"
                        :checked="star <= Math.round(averageRating)"
                        disabled
                      />
                    </div>
                    <p class="text-base-content/70">Based on {{ reviews.length }} reviews</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-2">
                    <span class="text-sm w-8">{{ rating }} ★</span>
                    <progress
                      class="progress progress-primary w-full"
                      :value="ratingDistribution[rating]"
                      :max="reviews.length"
                    ></progress>
                    <span class="text-sm w-8">{{ ratingDistribution[rating] }}</span>
                  </div>
                </div>
              </div>

              <!-- Individual Reviews -->
              <div class="space-y-4">
                <div
                  v-for="review in reviews"
                  :key="review.id"
                  class="card bg-base-100 shadow-md"
                >
                  <div class="card-body">
                    <div class="flex items-start gap-4">
                      <div class="avatar">
                        <div class="w-12 rounded-full">
                          <img :src="review.avatar" :alt="review.user" />
                        </div>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <h4 class="font-semibold">{{ review.user }}</h4>
                          <div v-if="review.verified" class="badge badge-success badge-sm">Verified Purchase</div>
                        </div>
                        <div class="flex items-center gap-2 mb-2">
                          <div class="rating rating-sm">
                            <input
                              v-for="star in getStarArray(review.rating)"
                              :key="star"
                              type="radio"
                              class="mask mask-star-2 bg-orange-400"
                              checked
                              disabled
                            />
                          </div>
                          <span class="text-sm text-base-content/70">{{ formatDate(review.date) }}</span>
                        </div>
                        <p class="text-base-content/80">{{ review.comment }}</p>
                        <div class="flex items-center gap-4 mt-4">
                          <button class="btn btn-ghost btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            Helpful ({{ review.helpful }})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Write Review Button -->
              <div class="text-center">
                <button class="btn btn-outline btn-primary">Write a Review</button>
              </div>
            </div>

            <!-- Shipping Tab -->
            <div v-if="activeTab === 'shipping'" class="prose max-w-none">
              <h3>Shipping Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                <div class="card bg-base-200">
                  <div class="card-body">
                    <h4 class="card-title text-lg">Standard Shipping</h4>
                    <p>5-7 business days</p>
                    <p class="text-2xl font-bold text-primary">$5.99</p>
                  </div>
                </div>
                <div class="card bg-base-200">
                  <div class="card-body">
                    <h4 class="card-title text-lg">Express Shipping</h4>
                    <p>2-3 business days</p>
                    <p class="text-2xl font-bold text-primary">$12.99</p>
                  </div>
                </div>
              </div>
              <p class="mt-4">Free shipping on orders over $50!</p>
              <h4>Return Policy</h4>
              <p>We offer a 30-day return policy for all products. Items must be unused and in original packaging.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.prose {
  max-width: none;
}
</style>
