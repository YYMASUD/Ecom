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
  return '/placeholder-product.jpg'
}

const getProductName = (item) => {
  return item.product?.name || item.name || 'Product'
}

const getProductPrice = (item) => {
  return item.product?.price || item.price || 0
}

const getProductId = (item) => {
  return item.product?._id || item.product || item.productId
}
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Shopping Cart</h1>
      <p class="text-gray-600">
        {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }} in your cart
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Empty Cart -->
    <div v-else-if="isEmpty" class="text-center py-20">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-24 w-24 mx-auto text-gray-300 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h2 class="text-2xl font-semibold mb-2">Your cart is empty</h2>
      <p class="text-gray-600 mb-6">Add some products to get started!</p>
      <router-link to="/" class="btn btn-primary">
        Continue Shopping
      </router-link>
    </div>

    <!-- Cart Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in cartItems"
          :key="getProductId(item)"
          class="card bg-base-100 shadow-md"
        >
          <div class="card-body p-4">
            <div class="flex gap-4">
              <!-- Product Image -->
              <div class="avatar">
                <div class="w-24 h-24 rounded-lg">
                  <img
                    :src="getProductImage(item)"
                    :alt="getProductName(item)"
                    class="object-cover"
                  />
                </div>
              </div>

              <!-- Product Details -->
              <div class="flex-1">
                <h3 class="font-semibold text-lg mb-1">
                  {{ getProductName(item) }}
                </h3>
                <p class="text-sm text-gray-600 mb-2">
                  Shop: {{ item.product?.shop?.name || 'N/A' }}
                </p>
                <p class="text-lg font-bold text-primary">
                  ${{ getProductPrice(item).toFixed(2) }}
                </p>
              </div>

              <!-- Quantity Controls -->
              <div class="flex flex-col items-end justify-between">
                <button
                  @click="removeItem(getProductId(item), getProductName(item))"
                  class="btn btn-ghost btn-sm btn-circle"
                  title="Remove item"
                >
                  <svg
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div class="flex items-center gap-2">
                  <button
                    @click="updateQuantity(getProductId(item), item.quantity - 1)"
                    class="btn btn-sm btn-circle btn-outline"
                    :disabled="item.quantity <= 1"
                  >
                    -
                  </button>
                  <span class="w-12 text-center font-semibold">
                    {{ item.quantity }}
                  </span>
                  <button
                    @click="updateQuantity(getProductId(item), item.quantity + 1)"
                    class="btn btn-sm btn-circle btn-outline"
                  >
                    +
                  </button>
                </div>

                <p class="text-sm font-semibold mt-2">
                  Total: ${{ (getProductPrice(item) * item.quantity).toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Clear Cart Button -->
        <div class="flex justify-end">
          <button @click="clearCart" class="btn btn-outline btn-error btn-sm">
            Clear Cart
          </button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="card bg-base-100 shadow-md sticky top-4">
          <div class="card-body">
            <h2 class="card-title mb-4">Order Summary</h2>

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-semibold">${{ subtotal.toFixed(2) }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Shipping</span>
                <span class="font-semibold">Calculated at checkout</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Tax</span>
                <span class="font-semibold">Calculated at checkout</span>
              </div>

              <div class="divider my-2"></div>

              <div class="flex justify-between text-lg">
                <span class="font-bold">Total</span>
                <span class="font-bold text-primary">
                  ${{ subtotal.toFixed(2) }}
                </span>
              </div>
            </div>

            <div class="card-actions mt-6">
              <button
                @click="proceedToCheckout"
                class="btn btn-primary btn-block"
                :disabled="isEmpty"
              >
                Proceed to Checkout
              </button>
            </div>

            <router-link to="/" class="btn btn-ghost btn-block mt-2">
              Continue Shopping
            </router-link>

            <!-- Trust Badges -->
            <div class="mt-6 pt-6 border-t space-y-2">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Secure Checkout</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Free Shipping on orders over $50</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>30-Day Return Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.avatar img {
  object-fit: cover;
}
</style>
