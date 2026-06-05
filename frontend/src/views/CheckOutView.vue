<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'
import axios from 'axios'

const cartStore = useCartStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const router = useRouter()

const currentStep = ref(1)
const loading = ref(false)
const processingOrder = ref(false)

// Form data
const shippingForm = ref({
  fullName: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postCode: '',
  country: 'United States'
})

const paymentMethod = ref('cod')
const sameAsBilling = ref(true)
const agreeToTerms = ref(false)

const billingForm = ref({
  fullName: '',
  address: '',
  city: '',
  province: '',
  postCode: '',
  country: 'United States'
})

const orderNotes = ref('')

// Computed
const cartItems = computed(() => cartStore.cartItems)
const subtotal = computed(() => cartStore.subtotal)
const shippingFee = computed(() => subtotal.value > 50 ? 0 : 10)
const tax = computed(() => subtotal.value * 0.1) // 10% tax
const total = computed(() => subtotal.value + shippingFee.value + tax.value)

const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return cartStore.itemCount > 0
    case 2:
      return validateShippingForm()
    case 3:
      return paymentMethod.value && agreeToTerms.value
    default:
      return false
  }
})

// Methods
const validateShippingForm = () => {
  return (
    shippingForm.value.fullName &&
    shippingForm.value.phone &&
    shippingForm.value.address &&
    shippingForm.value.city &&
    shippingForm.value.postCode &&
    shippingForm.value.country
  )
}

const nextStep = () => {
  if (!isStepValid.value) {
    notificationStore.warning('Please complete all required fields')
    return
  }
  
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const goToStep = (step) => {
  if (step <= currentStep.value || isStepValid.value) {
    currentStep.value = step
  }
}

const placeOrder = async () => {
  if (!isStepValid.value) {
    notificationStore.warning('Please complete all required fields')
    return
  }

  if (!agreeToTerms.value) {
    notificationStore.warning('Please agree to terms and conditions')
    return
  }

  processingOrder.value = true
  const loadingToast = notificationStore.loading('Processing your order...')

  try {
    const orderData = {
      shippingAddress: shippingForm.value,
      billingAddress: sameAsBilling.value ? shippingForm.value : billingForm.value,
      paymentMethod: paymentMethod.value,
      notes: orderNotes.value
    }

    const response = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'post',
      url: '/order/create',
      headers: {
        Authorization: `Bearer ${userStore.getToken}`
      },
      data: orderData
    })

    if (response.data.success) {
      notificationStore.remove(loadingToast)
      notificationStore.success('Order placed successfully!')
      
      // Redirect to order confirmation or order history
      setTimeout(() => {
        router.push(`/order/${response.data.order._id}`)
      }, 1500)
    }
  } catch (error) {
    notificationStore.remove(loadingToast)
    console.error('Order creation error:', error)
    notificationStore.error(
      error.response?.data?.message || 'Failed to place order. Please try again.'
    )
  } finally {
    processingOrder.value = false
  }
}

onMounted(async () => {
  loading.value = true
  await cartStore.fetchCart()
  
  // Redirect if cart is empty
  if (cartStore.isEmpty) {
    notificationStore.warning('Your cart is empty')
    router.push('/cart')
  }
  
  loading.value = false
})
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Checkout</h1>
      <p class="text-gray-600">Complete your purchase</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Checkout Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Checkout Steps -->
      <div class="lg:col-span-2">
        <!-- Progress Steps -->
        <ul class="steps steps-vertical lg:steps-horizontal w-full mb-8">
          <li
            class="step"
            :class="{ 'step-primary': currentStep >= 1 }"
            @click="goToStep(1)"
          >
            Cart Review
          </li>
          <li
            class="step"
            :class="{ 'step-primary': currentStep >= 2 }"
            @click="goToStep(2)"
          >
            Shipping
          </li>
          <li
            class="step"
            :class="{ 'step-primary': currentStep >= 3 }"
            @click="goToStep(3)"
          >
            Payment
          </li>
          <li
            class="step"
            :class="{ 'step-primary': currentStep >= 4 }"
          >
            Review
          </li>
        </ul>

        <!-- Step 1: Cart Review -->
        <div v-show="currentStep === 1" class="card bg-base-100 shadow-md">
          <div class="card-body">
            <h2 class="card-title mb-4">Review Your Items</h2>
            
            <div class="space-y-4">
              <div
                v-for="item in cartItems"
                :key="item.product?._id"
                class="flex gap-4 p-4 border rounded-lg"
              >
                <div class="avatar">
                  <div class="w-20 h-20 rounded">
                    <img
                      :src="item.product?.images?.[0] || '/placeholder.jpg'"
                      :alt="item.product?.name"
                    />
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold">{{ item.product?.name }}</h3>
                  <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                  <p class="font-bold text-primary">
                    ${{ ((item.product?.price || 0) * item.quantity).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="card-actions justify-between mt-6">
              <router-link to="/cart" class="btn btn-outline">
                Edit Cart
              </router-link>
              <button @click="nextStep" class="btn btn-primary">
                Continue to Shipping
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: Shipping Information -->
        <div v-show="currentStep === 2" class="card bg-base-100 shadow-md">
          <div class="card-body">
            <h2 class="card-title mb-4">Shipping Information</h2>
            
            <form class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Full Name *</span>
                </label>
                <input
                  v-model="shippingForm.fullName"
                  type="text"
                  placeholder="John Doe"
                  class="input input-bordered"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Phone Number *</span>
                </label>
                <input
                  v-model="shippingForm.phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  class="input input-bordered"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Address *</span>
                </label>
                <input
                  v-model="shippingForm.address"
                  type="text"
                  placeholder="123 Main Street, Apt 4B"
                  class="input input-bordered"
                  required
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">City *</span>
                  </label>
                  <input
                    v-model="shippingForm.city"
                    type="text"
                    placeholder="New York"
                    class="input input-bordered"
                    required
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text">State/Province</span>
                  </label>
                  <input
                    v-model="shippingForm.province"
                    type="text"
                    placeholder="NY"
                    class="input input-bordered"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Postal Code *</span>
                  </label>
                  <input
                    v-model="shippingForm.postCode"
                    type="text"
                    placeholder="10001"
                    class="input input-bordered"
                    required
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Country *</span>
                  </label>
                  <select
                    v-model="shippingForm.country"
                    class="select select-bordered"
                    required
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </form>

            <div class="card-actions justify-between mt-6">
              <button @click="previousStep" class="btn btn-outline">
                Back
              </button>
              <button @click="nextStep" class="btn btn-primary">
                Continue to Payment
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: Payment Method -->
        <div v-show="currentStep === 3" class="card bg-base-100 shadow-md">
          <div class="card-body">
            <h2 class="card-title mb-4">Payment Method</h2>
            
            <div class="space-y-4">
              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4">
                  <input
                    v-model="paymentMethod"
                    type="radio"
                    value="cod"
                    class="radio radio-primary"
                  />
                  <div>
                    <span class="label-text font-semibold">Cash on Delivery</span>
                    <p class="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </label>
              </div>

              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4">
                  <input
                    v-model="paymentMethod"
                    type="radio"
                    value="credit_card"
                    class="radio radio-primary"
                  />
                  <div>
                    <span class="label-text font-semibold">Credit/Debit Card</span>
                    <p class="text-sm text-gray-600">Pay securely with your card</p>
                  </div>
                </label>
              </div>

              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4">
                  <input
                    v-model="paymentMethod"
                    type="radio"
                    value="paypal"
                    class="radio radio-primary"
                  />
                  <div>
                    <span class="label-text font-semibold">PayPal</span>
                    <p class="text-sm text-gray-600">Pay with your PayPal account</p>
                  </div>
                </label>
              </div>

              <div class="divider"></div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Order Notes (Optional)</span>
                </label>
                <textarea
                  v-model="orderNotes"
                  class="textarea textarea-bordered h-24"
                  placeholder="Any special instructions for your order..."
                ></textarea>
              </div>

              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4">
                  <input
                    v-model="agreeToTerms"
                    type="checkbox"
                    class="checkbox checkbox-primary"
                  />
                  <span class="label-text">
                    I agree to the
                    <a href="#" class="link link-primary">Terms and Conditions</a>
                  </span>
                </label>
              </div>
            </div>

            <div class="card-actions justify-between mt-6">
              <button @click="previousStep" class="btn btn-outline">
                Back
              </button>
              <button @click="nextStep" class="btn btn-primary">
                Review Order
              </button>
            </div>
          </div>
        </div>

        <!-- Step 4: Review & Place Order -->
        <div v-show="currentStep === 4" class="card bg-base-100 shadow-md">
          <div class="card-body">
            <h2 class="card-title mb-4">Review Your Order</h2>
            
            <!-- Shipping Address -->
            <div class="mb-4">
              <h3 class="font-semibold mb-2">Shipping Address</h3>
              <div class="p-4 bg-base-200 rounded-lg">
                <p>{{ shippingForm.fullName }}</p>
                <p>{{ shippingForm.address }}</p>
                <p>
                  {{ shippingForm.city }}, {{ shippingForm.province }}
                  {{ shippingForm.postCode }}
                </p>
                <p>{{ shippingForm.country }}</p>
                <p class="mt-2">Phone: {{ shippingForm.phone }}</p>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="mb-4">
              <h3 class="font-semibold mb-2">Payment Method</h3>
              <div class="p-4 bg-base-200 rounded-lg">
                <p class="capitalize">{{ paymentMethod.replace('_', ' ') }}</p>
              </div>
            </div>

            <!-- Order Items -->
            <div class="mb-4">
              <h3 class="font-semibold mb-2">Order Items</h3>
              <div class="space-y-2">
                <div
                  v-for="item in cartItems"
                  :key="item.product?._id"
                  class="flex justify-between p-2 bg-base-200 rounded"
                >
                  <span>{{ item.product?.name }} x{{ item.quantity }}</span>
                  <span class="font-semibold">
                    ${{ ((item.product?.price || 0) * item.quantity).toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="card-actions justify-between mt-6">
              <button @click="previousStep" class="btn btn-outline">
                Back
              </button>
              <button
                @click="placeOrder"
                class="btn btn-primary"
                :disabled="processingOrder"
              >
                <span v-if="processingOrder" class="loading loading-spinner"></span>
                <span v-else>Place Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary Sidebar -->
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
                <span class="font-semibold">
                  {{ shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}` }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Tax (10%)</span>
                <span class="font-semibold">${{ tax.toFixed(2) }}</span>
              </div>

              <div class="divider my-2"></div>

              <div class="flex justify-between text-lg">
                <span class="font-bold">Total</span>
                <span class="font-bold text-primary">
                  ${{ total.toFixed(2) }}
                </span>
              </div>
            </div>

            <div class="alert alert-info mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="stroke-current flex-shrink-0 w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span class="text-sm">
                {{ shippingFee === 0 ? 'You qualify for free shipping!' : 'Add $' + (50 - subtotal).toFixed(2) + ' more for free shipping' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.steps .step-primary + .step-primary:before {
  background-color: hsl(var(--p));
}
</style>
