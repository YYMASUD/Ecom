<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const notificationStore = useNotificationStore()
const router = useRouter()

const loading = ref(false)

const cartItems = computed(() => cartStore.cartItems)
const itemCount = computed(() => cartStore.itemCount)
const subtotal = computed(() => cartStore.subtotal)
const isEmpty = computed(() => cartStore.isEmpty)

onMounted(async () => {
  loading.value = true
  await cartStore.fetchCart()
  loading.value = false
})

const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity < 1) return
  const result = await cartStore.updateQuantity(productId, newQuantity)
  if (result.success) {
    notificationStore.success('Cart updated')
  } else {
    notificationStore.error(result.message || 'Failed to update cart')
  }
}

const removeItem = async (productId, productName) => {
  if (!confirm(`Remove ${productName} from cart?`)) return
  const result = await cartStore.removeFromCart(productId)
  if (result.success) {
    notificationStore.success('Item removed from cart')
  } else {
    notificationStore.error(result.message || 'Failed to remove item')
  }
}

const clearCart = async () => {
  if (!confirm('Are you sure you want to clear your cart?')) return
  const result = await cartStore.clearCart()
  if (result.success) {
    notificationStore.success('Cart cleared')
  } else {
    notificationStore.error(result.message || 'Failed to clear cart')
  }
}

const proceedToCheckout = () => {
  if (isEmpty.value) {
    notificationStore.warning('Your cart is empty')
    return
  }
  router.push('/checkout')
}

const getProductImage = (item) => {
  if (item.product?.images && item.product.images.length > 0) {
    return item.product.images[0]
  }
  return 'https://placehold.co/200x200/f3f4f6/9ca3af?text=No+Image'
}

const getProductName = (item) => item.product?.name || item.name || 'Product'
const getProductPrice = (item) => item.product?.price || item.price || 0
const getProductId = (item) => item.product?._id || item.product || item.productId
</script>

<template>
  <div class="min-h-screen" style="background:#EAEDED">
    <div class="max-w-screen-xl mx-auto px-4 py-6">

      <!-- Page Header -->
      <div class="mb-5">
        <h1 class="text-2xl font-bold text-gray-900">Shopping Cart</h1>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color:#FF6B35;border-top-color:transparent"></div>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="isEmpty" class="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-20 px-4">
        <div class="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center" style="background:#FF6B351a">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#FF6B35" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p class="text-gray-500 mb-7">Add some products to get started!</p>
        <router-link to="/" class="btn-cta px-8 py-3 rounded-full font-bold text-base">Continue Shopping</router-link>
      </div>

      <!-- Cart Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

        <!-- Cart Items -->
        <div class="space-y-3">
          <!-- Items header (desktop) -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3 hidden md:flex items-center justify-between">
            <span class="font-bold text-gray-800">Shopping Cart ({{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }})</span>
            <button @click="clearCart" class="text-sm text-red-400 hover:text-red-600 transition-colors flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Clear Cart
            </button>
          </div>

          <!-- Item rows -->
          <div
            v-for="item in cartItems"
            :key="getProductId(item)"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div class="flex gap-4">
              <!-- Image -->
              <div class="shrink-0">
                <img
                  :src="getProductImage(item)"
                  :alt="getProductName(item)"
                  class="w-24 h-24 object-cover rounded-lg border border-gray-100"
                />
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h3 class="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 leading-snug">
                      {{ getProductName(item) }}
                    </h3>
                    <p class="text-xs text-gray-400 mt-0.5">by {{ item.product?.shop?.name || 'ShopHub Seller' }}</p>
                  </div>
                  <!-- Remove button -->
                  <button
                    @click="removeItem(getProductId(item), getProductName(item))"
                    class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div class="mt-3 flex items-center justify-between flex-wrap gap-3">
                  <!-- Quantity stepper -->
                  <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      @click="updateQuantity(getProductId(item), item.quantity - 1)"
                      :disabled="item.quantity <= 1"
                      class="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-base leading-none"
                    >−</button>
                    <span class="w-10 text-center text-sm font-bold border-x border-gray-200 py-1.5">{{ item.quantity }}</span>
                    <button
                      @click="updateQuantity(getProductId(item), item.quantity + 1)"
                      class="px-3 py-1.5 text-gray-600 hover:bg-gray-50 text-base leading-none"
                    >+</button>
                  </div>

                  <!-- Price -->
                  <div class="text-right">
                    <p class="sh-price text-base">${{ (getProductPrice(item) * item.quantity).toFixed(2) }}</p>
                    <p class="text-xs text-gray-400">${{ getProductPrice(item).toFixed(2) }} each</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile clear cart -->
          <div class="md:hidden flex justify-end">
            <button @click="clearCart" class="text-sm text-red-400 hover:text-red-600 transition-colors flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Clear Cart
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h2 class="font-bold text-gray-800 text-base mb-4">Order Summary</h2>

            <div class="space-y-2.5 text-sm">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal ({{ itemCount }} items)</span>
                <span class="font-semibold text-gray-800">${{ Number(subtotal).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span class="font-semibold" style="color:#007185">
                  {{ Number(subtotal) >= 50 ? 'FREE' : 'Calculated at checkout' }}
                </span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Estimated Tax</span>
                <span class="font-semibold text-gray-800">Calculated at checkout</span>
              </div>

              <div v-if="Number(subtotal) >= 50" class="bg-green-50 rounded-lg px-3 py-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span class="text-xs text-green-700 font-medium">You qualify for free shipping!</span>
              </div>
              <div v-else class="bg-orange-50 rounded-lg px-3 py-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#FF6B35"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="text-xs font-medium" style="color:#FF6B35">Add ${{ (50 - Number(subtotal)).toFixed(2) }} more for free shipping</span>
              </div>

              <div class="border-t border-gray-100 pt-3 mt-1">
                <div class="flex justify-between font-bold text-base">
                  <span class="text-gray-900">Order Total</span>
                  <span style="color:#B12704">${{ Number(subtotal).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <button
              @click="proceedToCheckout"
              class="btn-cta w-full mt-5 py-3.5 rounded-full font-bold text-base"
              :class="{ 'opacity-60 cursor-not-allowed': isEmpty }"
              :disabled="isEmpty"
            >
              Proceed to Checkout
            </button>

            <router-link to="/" class="block text-center mt-3 text-sm sh-link font-medium">
              ← Continue Shopping
            </router-link>

            <!-- Trust badges -->
            <div class="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
              <div v-for="t in [
                {icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label:'Secure Checkout'},
                {icon:'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', label:'Free Shipping Over $50'},
                {icon:'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label:'30-Day Return Policy'},
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
