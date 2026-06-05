<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'
import axios from 'axios'

const userStore = useUserStore()
const notificationStore = useNotificationStore()
const router = useRouter()

const orders = ref([])
const loading = ref(false)
const selectedStatus = ref('all')
const currentPage = ref(1)
const totalPages = ref(1)

const statusOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
]

const filteredOrders = computed(() => {
  if (selectedStatus.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.orderStatus === selectedStatus.value)
})

const fetchOrders = async () => {
  loading.value = true
  
  try {
    const params = {
      page: currentPage.value,
      limit: 10
    }
    
    if (selectedStatus.value !== 'all') {
      params.status = selectedStatus.value
    }

    const response = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'get',
      url: '/order',
      headers: {
        Authorization: `Bearer ${userStore.getToken}`
      },
      params
    })

    if (response.data.success) {
      orders.value = response.data.orders
      totalPages.value = response.data.pagination.pages
    }
  } catch (error) {
    console.error('Fetch orders error:', error)
    notificationStore.error('Failed to load orders')
  } finally {
    loading.value = false
  }
}

const viewOrderDetails = (orderId) => {
  router.push(`/order/${orderId}`)
}

const cancelOrder = async (orderId, orderNumber) => {
  if (!confirm(`Are you sure you want to cancel order ${orderNumber}?`)) {
    return
  }

  try {
    const response = await axios({
      baseURL: import.meta.env.VITE_BACKENDURL,
      method: 'put',
      url: `/order/${orderId}/cancel`,
      headers: {
        Authorization: `Bearer ${userStore.getToken}`
      },
      data: {
        reason: 'Cancelled by customer'
      }
    })

    if (response.data.success) {
      notificationStore.success('Order cancelled successfully')
      await fetchOrders()
    }
  } catch (error) {
    console.error('Cancel order error:', error)
    notificationStore.error(
      error.response?.data?.message || 'Failed to cancel order'
    )
  }
}

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
  return `badge ${classes[status] || 'badge-ghost'}`
}

const getPaymentStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge-warning',
    paid: 'badge-success',
    failed: 'badge-error',
    refunded: 'badge-info'
  }
  return `badge ${classes[status] || 'badge-ghost'}`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const canCancelOrder = (order) => {
  return ['pending', 'confirmed'].includes(order.orderStatus)
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Order History</h1>
      <p class="text-gray-600">View and manage your orders</p>
    </div>

    <!-- Filters -->
    <div class="card bg-base-100 shadow-md mb-6">
      <div class="card-body p-4">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Filter by Status</span>
            </label>
            <select
              v-model="selectedStatus"
              @change="fetchOrders"
              class="select select-bordered"
            >
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="flex-1"></div>

          <button @click="fetchOrders" class="btn btn-outline">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredOrders.length === 0" class="text-center py-20">
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h2 class="text-2xl font-semibold mb-2">No orders found</h2>
      <p class="text-gray-600 mb-6">
        {{ selectedStatus === 'all' ? "You haven't placed any orders yet" : `No ${selectedStatus} orders` }}
      </p>
      <router-link to="/" class="btn btn-primary">
        Start Shopping
      </router-link>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order._id"
        class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
      >
        <div class="card-body">
          <!-- Order Header -->
          <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <h3 class="font-bold text-lg">Order #{{ order.orderNumber }}</h3>
              <p class="text-sm text-gray-600">
                Placed on {{ formatDate(order.created_at) }}
              </p>
            </div>
            <div class="flex gap-2">
              <span :class="getStatusBadgeClass(order.orderStatus)">
                {{ order.orderStatus }}
              </span>
              <span :class="getPaymentStatusBadgeClass(order.paymentStatus)">
                {{ order.paymentStatus }}
              </span>
            </div>
          </div>

          <!-- Order Items Preview -->
          <div class="space-y-2 mb-4">
            <div
              v-for="(item, index) in order.items.slice(0, 2)"
              :key="index"
              class="flex gap-3 items-center"
            >
              <div class="avatar">
                <div class="w-16 h-16 rounded">
                  <img
                    :src="item.image || '/placeholder.jpg'"
                    :alt="item.name"
                  />
                </div>
              </div>
              <div class="flex-1">
                <p class="font-semibold">{{ item.name }}</p>
                <p class="text-sm text-gray-600">
                  Qty: {{ item.quantity }} × ${{ item.price.toFixed(2) }}
                </p>
              </div>
            </div>
            <p v-if="order.items.length > 2" class="text-sm text-gray-600 pl-20">
              +{{ order.items.length - 2 }} more item(s)
            </p>
          </div>

          <!-- Order Summary -->
          <div class="flex flex-wrap justify-between items-center gap-4 pt-4 border-t">
            <div>
              <p class="text-sm text-gray-600">Total Amount</p>
              <p class="text-2xl font-bold text-primary">
                ${{ order.pricing.total.toFixed(2) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                @click="viewOrderDetails(order._id)"
                class="btn btn-outline btn-sm"
              >
                View Details
              </button>
              <button
                v-if="canCancelOrder(order)"
                @click="cancelOrder(order._id, order.orderNumber)"
                class="btn btn-outline btn-error btn-sm"
              >
                Cancel Order
              </button>
              <button
                v-if="order.trackingNumber"
                class="btn btn-outline btn-primary btn-sm"
              >
                Track Order
              </button>
            </div>
          </div>

          <!-- Tracking Info -->
          <div
            v-if="order.trackingNumber"
            class="alert alert-info mt-4"
          >
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
            <div>
              <p class="font-semibold">Tracking Number: {{ order.trackingNumber }}</p>
              <p class="text-sm" v-if="order.carrier">Carrier: {{ order.carrier }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <div class="btn-group">
        <button
          @click="currentPage--; fetchOrders()"
          :disabled="currentPage === 1"
          class="btn"
        >
          «
        </button>
        <button class="btn">
          Page {{ currentPage }} of {{ totalPages }}
        </button>
        <button
          @click="currentPage++; fetchOrders()"
          :disabled="currentPage === totalPages"
          class="btn"
        >
          »
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style>