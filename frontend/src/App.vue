<script>
import axios from "axios";
import { useUserStore } from "@/stores/user";
import { useCartStore } from "@/stores/cart";
import ToastNotification from "@/components/ToastNotification.vue";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

export default {
  components: { ToastNotification },

  setup() {
    const userStore = useUserStore();
    const cartStore = useCartStore();
    return { userStore, cartStore };
  },

  data() {
    return {
      user: {
        isLoggedIn: false,
        token: "",
        role: "",
        id: "",
        email: "",
        username: "",
        avatar: DEFAULT_AVATAR,
      },
      showMobileMenu: false,
      showMobileSearch: false,
      searchQuery: "",
    };
  },

  async created() {
    const token = this.userStore.getToken;
    if (token) {
      const tokenUser = this.userStore.getUser;
      if (!tokenUser) {
        this.userStore.removeToken();
        this.cartStore.loadFromLocalStorage();
        return;
      }
      this.user.isLoggedIn = true;
      this.user.token = token;
      this.user.role = tokenUser.role;
      this.user.id = tokenUser.id;
      try {
        const userRes = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/user/show",
          params: { userID: tokenUser.id },
        });
        const data = userRes.data;
        this.user.email = data.email || "";
        this.user.username = data.username || "";
        this.user.avatar = data.avatar || DEFAULT_AVATAR;
      } catch (e) {
        console.error("Failed to load user profile:", e);
      }
      await this.cartStore.fetchCart();
    } else {
      this.cartStore.loadFromLocalStorage();
    }
  },

  methods: {
    logOut() {
      this.userStore.removeToken();
      this.cartStore.resetCart();
      this.user.isLoggedIn = false;
      this.user.role = "";
      this.user.id = "";
      this.user.email = "";
      this.user.username = "";
      this.user.avatar = DEFAULT_AVATAR;
      this.$router.push("/");
    },
    doSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push({ path: "/products", query: { search: this.searchQuery.trim() } });
        this.searchQuery = "";
        this.showMobileSearch = false;
      }
    },
  },
};
</script>

<template>
  <div data-theme="shophub" class="min-h-screen flex flex-col" style="background:#EAEDED">

    <!-- ─── TOP ANNOUNCEMENT BAR ─── -->
    <div class="hidden md:flex items-center justify-center gap-6 text-xs py-1.5 text-white font-medium" style="background:#0a1929">
      <span>🚚 Free shipping on orders over $50</span>
      <span class="opacity-40">|</span>
      <span>📞 +1 (555) 123-4567</span>
      <span class="opacity-40">|</span>
      <span>📧 support@shophub.com</span>
    </div>

    <!-- ─── STICKY HEADER ─── -->
    <header class="sticky top-0 z-50 sh-header shadow-lg">
      <div class="max-w-screen-xl mx-auto px-3 md:px-6 py-2.5 flex items-center gap-3 md:gap-5">

        <!-- LOGO -->
        <router-link to="/" class="flex items-center gap-2 shrink-0 group">
          <div class="w-8 h-8 rounded-md flex items-center justify-center" style="background:#FF6B35">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <span class="text-white font-extrabold text-lg tracking-tight hidden sm:block group-hover:text-orange-300 transition-colors">ShopHub</span>
        </router-link>

        <!-- SEARCH – desktop -->
        <div class="sh-search-wrap hidden md:flex flex-1 h-10 max-w-2xl">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for products, brands and more..."
            @keyup.enter="doSearch"
          />
          <button class="sh-search-btn" @click="doSearch" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
        </div>

        <!-- RIGHT ACTIONS -->
        <div class="flex items-center gap-1 md:gap-3 ml-auto md:ml-0">

          <!-- Mobile search toggle -->
          <button class="md:hidden p-2 text-white hover:text-orange-300 transition-colors" @click="showMobileSearch = !showMobileSearch" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>

          <!-- Account & Lists (guest) -->
          <router-link
            v-if="!user.isLoggedIn"
            to="/login"
            class="hidden sm:flex flex-col text-white hover:text-orange-300 transition-colors leading-tight"
          >
            <span class="text-xs opacity-80">Hello, sign in</span>
            <span class="text-sm font-bold">Account & Lists</span>
          </router-link>

          <!-- Account dropdown (logged in) -->
          <div v-if="user.isLoggedIn" class="dropdown dropdown-end hidden sm:block">
            <label tabindex="0" class="flex flex-col text-white hover:text-orange-300 transition-colors leading-tight cursor-pointer">
              <span class="text-xs opacity-80">Hello, {{ user.username || 'User' }}</span>
              <span class="text-sm font-bold flex items-center gap-1">
                Account & Lists
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              </span>
            </label>
            <ul tabindex="0" class="dropdown-content menu p-3 shadow-2xl bg-white rounded-lg w-56 z-50 mt-3 border border-gray-100 text-gray-800">
              <li class="px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wide">Your Account</li>
              <li><router-link to="/profile" class="flex items-center gap-2 px-3 py-2 hover:bg-orange-50 rounded-lg text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                My Profile
              </router-link></li>
              <li><router-link to="/orders" class="flex items-center gap-2 px-3 py-2 hover:bg-orange-50 rounded-lg text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                My Orders
              </router-link></li>
              <li v-if="user.role === 'seller'"><router-link to="/dashboard" class="flex items-center gap-2 px-3 py-2 hover:bg-orange-50 rounded-lg text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Seller Dashboard
              </router-link></li>
              <li v-if="user.role === 'admin'"><router-link to="/admin" class="flex items-center gap-2 px-3 py-2 hover:bg-orange-50 rounded-lg text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Admin Panel
              </router-link></li>
              <li><hr class="my-1 border-gray-100"/></li>
              <li><a @click="logOut" class="flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg text-sm text-red-500 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Sign Out
              </a></li>
            </ul>
          </div>

          <!-- Returns & Orders (desktop) -->
          <router-link to="/orders" class="hidden lg:flex flex-col text-white hover:text-orange-300 transition-colors leading-tight">
            <span class="text-xs opacity-80">Returns</span>
            <span class="text-sm font-bold">& Orders</span>
          </router-link>

          <!-- Cart -->
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="flex items-end gap-1 text-white hover:text-orange-300 transition-colors cursor-pointer relative px-1" aria-label="Cart">
              <div class="relative">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span
                  v-if="cartStore.itemCount > 0"
                  class="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-extrabold flex items-center justify-center"
                  style="background:#FF6B35;color:#fff"
                >{{ cartStore.itemCount }}</span>
              </div>
              <span class="text-sm font-bold hidden sm:block mb-0.5">Cart</span>
            </label>
            <div tabindex="0" class="dropdown-content mt-3 w-80 bg-white shadow-2xl rounded-lg z-50 border border-gray-100 overflow-hidden">
              <div class="p-4 border-b border-gray-100">
                <span class="font-bold text-gray-800 text-base">Shopping Cart ({{ cartStore.itemCount }})</span>
              </div>
              <div class="p-4">
                <div class="flex justify-between mb-3">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-bold text-lg" style="color:#B12704">${{ Number(cartStore.subtotal || 0).toFixed(2) }}</span>
                </div>
                <router-link to="/cart" class="btn-cta w-full text-center block py-2.5 rounded-lg font-semibold">
                  Go to Cart
                </router-link>
              </div>
            </div>
          </div>

          <!-- Mobile hamburger -->
          <button class="md:hidden p-2 text-white hover:text-orange-300 transition-colors" @click="showMobileMenu = !showMobileMenu" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile search bar -->
      <div v-if="showMobileSearch" class="md:hidden px-3 pb-3" style="background:#131921">
        <div class="sh-search-wrap h-10">
          <input v-model="searchQuery" type="text" placeholder="Search products..." @keyup.enter="doSearch" />
          <button class="sh-search-btn" @click="doSearch" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Category nav bar (desktop) -->
      <nav class="sh-header-nav hidden lg:block">
        <div class="max-w-screen-xl mx-auto px-6">
          <ul class="flex items-center gap-1 text-sm font-medium text-white py-1.5">
            <li>
              <button class="flex items-center gap-1.5 px-3 py-1.5 hover:outline hover:outline-1 hover:outline-white rounded transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                All Departments
              </button>
            </li>
            <li><router-link to="/" exact-active-class="text-orange-300 font-bold" class="px-3 py-1.5 hover:outline hover:outline-1 hover:outline-white rounded block transition-all">Home</router-link></li>
            <li><router-link to="/products" active-class="text-orange-300 font-bold" class="px-3 py-1.5 hover:outline hover:outline-1 hover:outline-white rounded block transition-all">Products</router-link></li>
            <li><router-link to="/categories" active-class="text-orange-300 font-bold" class="px-3 py-1.5 hover:outline hover:outline-1 hover:outline-white rounded block transition-all">Categories</router-link></li>
            <li><router-link to="/shops" active-class="text-orange-300 font-bold" class="px-3 py-1.5 hover:outline hover:outline-1 hover:outline-white rounded block transition-all">Shops</router-link></li>
            <li class="ml-2 px-3 py-1.5 text-orange-300 font-semibold">🔥 Today's Deals</li>
            <li class="px-3 py-1.5 text-orange-300 font-semibold">⭐ Best Sellers</li>
          </ul>
        </div>
      </nav>

      <!-- Mobile fly-out menu -->
      <div v-if="showMobileMenu" class="lg:hidden bg-white border-t border-gray-200 shadow-xl z-40" @click="showMobileMenu = false">
        <div class="px-4 py-4 space-y-1">
          <router-link to="/" class="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 rounded-lg text-gray-800 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
            Home
          </router-link>
          <router-link to="/products" class="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 rounded-lg text-gray-800 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            Products
          </router-link>
          <router-link to="/categories" class="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 rounded-lg text-gray-800 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            Categories
          </router-link>
          <router-link to="/shops" class="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 rounded-lg text-gray-800 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Shops
          </router-link>
          <div class="border-t border-gray-100 pt-3 mt-2">
            <template v-if="!user.isLoggedIn">
              <router-link to="/login" class="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 rounded-lg text-gray-800 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                Sign In
              </router-link>
              <router-link to="/register" class="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 rounded-lg text-gray-800 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                Create Account
              </router-link>
            </template>
            <template v-else>
              <router-link to="/profile" class="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 rounded-lg text-gray-800 font-medium">
                <img :src="user.avatar" class="w-5 h-5 rounded-full" alt="me"/>
                My Profile
              </router-link>
              <router-link to="/orders" class="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 rounded-lg text-gray-800 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                My Orders
              </router-link>
              <button @click="logOut" class="flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg text-red-500 font-medium w-full text-left">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Sign Out
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- ─── TOAST ─── -->
    <ToastNotification />

    <!-- ─── PAGE CONTENT ─── -->
    <main class="flex-1 pb-16 md:pb-0">
      <router-view :userID="user.id" />
    </main>

    <!-- ─── DESKTOP FOOTER ─── -->
    <footer class="hidden md:block" style="background:#131921;color:#fff">
      <!-- Back to top -->
      <div
        class="text-center py-3 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
        style="background:#232F3E"
        @click="window && window.scrollTo({top:0,behavior:'smooth'})"
      >
        Back to top
      </div>

      <!-- Footer links -->
      <div class="max-w-screen-xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-md flex items-center justify-center" style="background:#FF6B35">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <span class="font-extrabold text-base">ShopHub</span>
          </div>
          <p class="text-sm opacity-60 leading-relaxed">Your one-stop shop for quality products from verified sellers worldwide.</p>
        </div>
        <div>
          <h3 class="font-bold text-sm uppercase tracking-wider opacity-80 mb-4">Shop</h3>
          <ul class="space-y-2 text-sm opacity-60">
            <li><router-link to="/products" class="hover:opacity-100 hover:text-orange-300 transition-colors">Products</router-link></li>
            <li><router-link to="/categories" class="hover:opacity-100 hover:text-orange-300 transition-colors">Categories</router-link></li>
            <li><router-link to="/shops" class="hover:opacity-100 hover:text-orange-300 transition-colors">Shops</router-link></li>
            <li><a class="hover:opacity-100 hover:text-orange-300 transition-colors cursor-pointer">Today's Deals</a></li>
          </ul>
        </div>
        <div>
          <h3 class="font-bold text-sm uppercase tracking-wider opacity-80 mb-4">Account</h3>
          <ul class="space-y-2 text-sm opacity-60">
            <li><router-link to="/login" class="hover:opacity-100 hover:text-orange-300 transition-colors">Sign In</router-link></li>
            <li><router-link to="/register" class="hover:opacity-100 hover:text-orange-300 transition-colors">Create Account</router-link></li>
            <li><router-link to="/orders" class="hover:opacity-100 hover:text-orange-300 transition-colors">My Orders</router-link></li>
            <li><router-link to="/profile" class="hover:opacity-100 hover:text-orange-300 transition-colors">My Profile</router-link></li>
          </ul>
        </div>
        <div>
          <h3 class="font-bold text-sm uppercase tracking-wider opacity-80 mb-4">Support</h3>
          <ul class="space-y-2 text-sm opacity-60">
            <li><a class="hover:opacity-100 hover:text-orange-300 transition-colors cursor-pointer">Help Center</a></li>
            <li><a class="hover:opacity-100 hover:text-orange-300 transition-colors cursor-pointer">Contact Us</a></li>
            <li><a class="hover:opacity-100 hover:text-orange-300 transition-colors cursor-pointer">Returns & Refunds</a></li>
            <li><a class="hover:opacity-100 hover:text-orange-300 transition-colors cursor-pointer">FAQ</a></li>
          </ul>
        </div>
      </div>

      <!-- Footer bottom bar -->
      <div class="border-t py-5 text-center text-xs opacity-50" style="border-color:#2d3748">
        <p>© 2024 ShopHub. All rights reserved. &nbsp;|&nbsp; Privacy Policy &nbsp;|&nbsp; Terms of Service</p>
      </div>
    </footer>

    <!-- ─── MOBILE BOTTOM NAV ─── -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t shadow-lg" style="border-color:#e5e7eb">
      <div class="flex items-stretch justify-around h-14">

        <router-link to="/" class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs transition-colors"
          :class="$route.path === '/' ? 'text-orange-500 font-semibold' : 'text-gray-500'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          <span>Home</span>
        </router-link>

        <router-link to="/products" class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs transition-colors"
          :class="$route.path.startsWith('/product') ? 'text-orange-500 font-semibold' : 'text-gray-500'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <span>Search</span>
        </router-link>

        <router-link to="/cart" class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs transition-colors"
          :class="$route.path === '/cart' ? 'text-orange-500 font-semibold' : 'text-gray-500'">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span v-if="cartStore.itemCount > 0"
              class="absolute -top-1.5 -right-1.5 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
              style="background:#FF6B35">{{ cartStore.itemCount }}</span>
          </div>
          <span>Cart</span>
        </router-link>

        <router-link v-if="user.isLoggedIn" to="/orders" class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs transition-colors"
          :class="$route.path === '/orders' ? 'text-orange-500 font-semibold' : 'text-gray-500'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <span>Orders</span>
        </router-link>

        <router-link v-else to="/login" class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs transition-colors"
          :class="$route.path === '/login' ? 'text-orange-500 font-semibold' : 'text-gray-500'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          <span>Sign In</span>
        </router-link>

        <router-link v-if="user.isLoggedIn" to="/profile" class="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs transition-colors"
          :class="$route.path === '/profile' ? 'text-orange-500 font-semibold' : 'text-gray-500'">
          <div class="w-5 h-5 rounded-full overflow-hidden ring-1" style="ring-color:#FF6B35">
            <img :src="user.avatar" alt="me" class="w-full h-full object-cover"/>
          </div>
          <span>Me</span>
        </router-link>

      </div>
    </nav>

  </div>
</template>
