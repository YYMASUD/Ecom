<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const order = ref(null)
const loading = ref(false)

const orderId = computed(() => route.params.orderId)

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-error',
    returned: 'badge-error'
  }
  return `badge badge-lg ${classes[status] || 'badge-ghost'}`
}

const getPaymentStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge-warning',
    paid: 'badge-success',
    failed: 'badge-error',
    refunded: 'badge-info'
  }
  return `badge badge-lg ${classes[status] || 'badge-ghost'}`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const canCancelOrder = computed(() => {
  return order.value && ['pending', 'confirmed'].includes(order.value.orderStatus)
})

const fetchOrderDetails = async () => {
  loading.value = true
  
  try {
    const response = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'get',
      url: `/order/${orderId.value}`,
      headers: {
        Authorization: `Bearer ${userStore.getToken}`
      }
    })

    if (response.data.success) {
      order.value = response.data.order
    }
  } catch (error) {
    console.error('Fetch order error:', error)
    notificationStore.error('Failed to load order details')
    router.push('/orders')
  } finally {
    loading.value = false
  }
}

const cancelOrder = async () => {
  if (!confirm(`Are you sure you want to cancel order ${order.value.orderNumber}?`)) {
    return
  }

  try {
    const response = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'put',
      url: `/order/${orderId.value}/cancel`,
      headers: {
        Authorization: `Bearer ${userStore.getToken}`
      },
      data: {
        reason: 'Cancelled by customer'
      }
    })

    if (response.data.success) {
      notificationStore.success('Order cancelled successfully')
      await fetchOrderDetails()
    }
  } catch (error) {
    console.error('Cancel order error:', error)
    notificationStore.error(
      error.response?.data?.message || 'Failed to cancel order'
    )
  }
}

const printInvoice = () => {
  window.print()
}

onMounted(() => {
  fetchOrderDetails()
})
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Order Details -->
    <div v-else-if="order" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap justify-between items-start gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <button @click="router.push('/orders')" class="btn btn-ghost btn-sm btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 class="text-3xl font-bold">Order #{{ order.orderNumber }}</h1>
          </div>
          <p class="text-gray-600">Placed on {{ formatDate(order.created_at) }}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <span :class="getStatusBadgeClass(order.orderStatus)">
            {{ order.orderStatus }}
          </span>
          <span :class="getPaymentStatusBadgeClass(order.paymentStatus)">
            {{ order.paymentStatus }}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-2">
        <button
          v-if="canCancelOrder"
          @click="cancelOrder"
          class="btn btn-outline btn-error"
        >
          Cancel Order
        </button>
        <button
          v-if="order.trackingNumber"
          class="btn btn-outline btn-primary"
        >
          Track Shipment
        </button>
        <button @click="printInvoice" class="btn btn-outline">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Invoice
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Items -->
          <div class="card bg-base-100 shadow-md">
            <div class="card-body">
              <h2 class="card-title mb-4">Order Items</h2>
              
              <div class="space-y-4">
                <div
                  v-for="(item, index) in order.items"
                  :key="index"
                  class="flex gap-4 p-4 border rounded-lg"
                >
                  <div class="avatar">
                    <div class="w-24 h-24 rounded">
                      <img
                        :src="item.image || '/placeholder.jpg'"
                        :alt="item.name"
                      />
                    </div>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg">{{ item.name }}</h3>
                    <p class="text-sm text-gray-600 mb-2">
                      Shop: {{ item.shop?.name || 'N/A' }}
                    </p>
                    <div class="flex justify-between items-center">
                      <p class="text-gray-600">
                        Quantity: {{ item.quantity }}
                      </p>
                      <p class="text-lg font-bold text-primary">
                        ${{ (item.price * item.quantity).toFixed(2) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Timeline -->
          <div class="card bg-base-100 shadow-md">
            <div class="card-body">
              <h2 class="card-title mb-4">Order Timeline</h2>
              
              <ul class="timeline timeline-vertical">
                <li
                  v-for="(history, index) in order.statusHistory"
                  :key="index"
                >
                  <div class="timeline-start">{{ formatDate(history.timestamp) }}</div>
                  <div class="timeline-middle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="w-5 h-5 text-primary"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="timeline-end timeline-box">
                    <p class="font-semibold capitalize">{{ history.status }}</p>
                    <p v-if="history.note" class="text-sm text-gray-600">{{ history.note }}</p>
                  </div>
                  <hr v-if="index < order.statusHistory.length - 1" class="bg-primary" />
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Order Summary -->
          <div class="card bg-base-100 shadow-md">
            <div class="card-body">
              <h2 class="card-title mb-4">Order Summary</h2>
              
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-semibold">${{ order.pricing.subtotal.toFixed(2) }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">Shipping</span>
                  <span class="font-semibold">
                    ${{ order.pricing.shippingFee.toFixed(2) }}
                  </span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">Tax</span>
                  <span class="font-semibold">${{ order.pricing.tax.toFixed(2) }}</span>
                </div>

                <div v-if="order.pricing.discount > 0" class="flex justify-between text-success">
                  <span>Discount</span>
                  <span class="font-semibold">-${{ order.pricing.discount.toFixed(2) }}</span>
                </div>

                <div class="divider my-2"></div>

                <div class="flex justify-between text-lg">
                  <span class="font-bold">Total</span>
                  <span class="font-bold text-primary">
                    ${{ order.pricing.total.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="card bg-base-100 shadow-md">
            <div class="card-body">
              <h2 class="card-title mb-4">Shipping Address</h2>
              
              <div class="space-y-1">
                <p class="font-semibold">{{ order.shippingAddress.fullName }}</p>
                <p>{{ order.shippingAddress.address }}</p>
                <p>
                  {{ order.shippingAddress.city }}, 
                  {{ order.shippingAddress.province }} 
                  {{ order.shippingAddress.postCode }}
                </p>
                <p>{{ order.shippingAddress.country }}</p>
                <p class="mt-2">Phone: {{ order.shippingAddress.phone }}</p>
              </div>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="card bg-base-100 shadow-md">
            <div class="card-body">
              <h2 class="card-title mb-4">Payment Information</h2>
              
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Method</span>
                  <span class="font-semibold capitalize">
                    {{ order.paymentMethod.replace('_', ' ') }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Status</span>
                  <span :class="getPaymentStatusBadgeClass(order.paymentStatus)">
                    {{ order.paymentStatus }}
                  </span>
                </div>
                <div v-if="order.paymentDetails?.transactionId" class="flex justify-between">
                  <span class="text-gray-600">Transaction ID</span>
                  <span class="font-mono text-sm">
                    {{ order.paymentDetails.transactionId }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tracking Information -->
          <div v-if="order.trackingNumber" class="card bg-base-100 shadow-md">
            <div class="card-body">
              <h2 class="card-title mb-4">Tracking Information</h2>
              
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-600">Tracking Number</p>
                  <p class="font-mono font-semibold">{{ order.trackingNumber }}</p>
                </div>
                <div v-if="order.carrier">
                  <p class="text-sm text-gray-600">Carrier</p>
                  <p class="font-semibold">{{ order.carrier }}</p>
                </div>
                <div v-if="order.estimatedDelivery">
                  <p class="text-sm text-gray-600">Estimated Delivery</p>
                  <p class="font-semibold">{{ formatDate(order.estimatedDelivery) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Notes -->
          <div v-if="order.notes" class="card bg-base-100 shadow-md">
            <div class="card-body">
              <h2 class="card-title mb-4">Order Notes</h2>
              <p class="text-gray-700">{{ order.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
@media print {
  .btn,
  button {
    display: none;
  }
}
</style>