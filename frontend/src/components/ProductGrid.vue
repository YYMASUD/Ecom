<script>
import { useCartStore } from "@/stores/cart";
import { useNotificationStore } from "@/stores/notification";

export default {
  props: {
    products: {
      type: [Array, Object],
      default: () => [],
    },
  },

  setup() {
    const cartStore = useCartStore();
    const notification = useNotificationStore();
    return { cartStore, notification };
  },

  computed: {
    productList() {
      if (!this.products) return [];
      if (Array.isArray(this.products)) return this.products;
      return Object.values(this.products);
    },
  },

  methods: {
    trimText(text = "", n = 20) {
      if (!text) return "";
      return text.length > n ? text.substring(0, n) + "..." : text;
    },

    getImage(product) {
      if (product.images && product.images.length > 0 && product.images[0]) {
        return product.images[0];
      }
      return "https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image";
    },

    async addToCart(product) {
      const result = await this.cartStore.addToCart(product, 1);
      if (result && result.success) {
        this.notification.success("Added to cart!");
      } else {
        this.notification.error(result?.message || "Failed to add to cart");
      }
    },
  },
};
</script>

<template>
  <div v-if="productList.length === 0" class="text-center py-16">
    <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style="background:#FF6B351a">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="#FF6B35" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    </div>
    <p class="text-gray-500 font-medium">No products found.</p>
  </div>

  <div v-else class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
    <div
      v-for="product in productList"
      :key="product._id"
      class="sh-product-card group"
    >
      <!-- Image -->
      <div class="relative overflow-hidden">
        <img
          :src="getImage(product)"
          :alt="product.name"
          class="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <!-- Out of stock overlay -->
        <div v-if="product.stock === 0" class="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span class="text-white text-xs font-bold px-2 py-1 rounded" style="background:#ef4444">Out of Stock</span>
        </div>
        <!-- Low stock badge -->
        <div v-if="product.stock > 0 && product.stock < 10" class="absolute top-2 left-2">
          <span class="sh-badge-sale">Only {{ product.stock }} left</span>
        </div>
      </div>

      <!-- Body -->
      <div class="p-3 flex flex-col gap-1">
        <h2 class="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
          {{ product.name }}
        </h2>

        <!-- Stars -->
        <div class="flex items-center gap-0.5" style="color:#FFA41C">
          <svg v-for="s in 5" :key="s" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" :fill="s <= 4 ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
          <span class="text-[11px] text-gray-400 ml-1">{{ Math.floor(Math.random()*500 + 10) }}</span>
        </div>

        <!-- Price -->
        <div class="flex items-center justify-between mt-1">
          <span class="sh-price">${{ Number(product.price).toFixed(2) }}</span>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mt-2">
          <router-link
            :to="'/product/' + product._id"
            class="flex-1 text-center text-xs font-semibold py-2 rounded-lg border transition-all"
            style="border-color:#007185;color:#007185"
            onmouseover="this.style.background='#007185';this.style.color='#fff'"
            onmouseout="this.style.background='transparent';this.style.color='#007185'"
          >
            View
          </router-link>
          <button
            class="flex-1 text-xs font-semibold py-2 rounded-lg transition-all"
            :disabled="product.stock === 0"
            style="background:#FF6B35;color:#fff"
            @click="addToCart(product)"
            @mouseover="$event.target.style.background='#e85c25'"
            @mouseout="$event.target.style.background='#FF6B35'"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
