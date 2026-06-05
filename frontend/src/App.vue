<script>
import axios from "axios";
import { useUserStore } from "@/stores/user";
import { useCartStore } from "@/stores/cart";
import ToastNotification from "@/components/ToastNotification.vue";
import SearchBar from "@/components/SearchBar.vue";

export default {
  components: {
    ToastNotification,
    SearchBar,
  },
  setup() {
    const userStore = useUserStore();
    const cartStore = useCartStore();
    return { userStore, cartStore };
  },
  data() {
    return {
      user: {
        isLoggedIn: false,
        token: this.userStore.getToken || "",
        role: "",
        id: "",
        email: "",
        username: "",
        avatar: "",
      },
      showMobileSearch: false,
    };
  },
  async created() {
    if (this.user.token) {
      this.user.isLoggedIn = true;

      const tokenUser = this.userStore.getUser;
      this.user.role = tokenUser.role;
      this.user.id = tokenUser.id;

      const user = await axios({
        baseURL: import.meta.env.VITE_BACKENDURL,
        method: "get",
        url: "/user/show",
        params: {
          userID: this.user.id,
        },
      });

      this.user.email = user.data.email;
      this.user.username = user.data.username;
      this.user.avatar = user.data.avatar;

      // Load cart when user is logged in
      await this.cartStore.fetchCart();
    } else {
      // Load cart from localStorage for guest users
      this.cartStore.loadFromLocalStorage();
    }
  },
  methods: {
    logOut() {
      try {
        this.userStore.removeToken();
        this.user.isLoggedIn = false;
        console.log(this.userStore.getToken);
      } catch (e) {
        console.log(e);
      }
    },
    toggleMobileSearch() {
      this.showMobileSearch = !this.showMobileSearch;
    },
  },
};
</script>

<template>
  <!-- Top Header Bar -->
  <div class="bg-primary text-primary-content py-2 px-4 text-sm hidden md:block">
    <div class="container mx-auto flex justify-between items-center">
      <div class="flex items-center gap-4">
        <span>📧 support@ecommerce.com</span>
        <span>📞 +1 (555) 123-4567</span>
      </div>
      <div class="flex items-center gap-4">
        <span>🚚 Free shipping on orders over $50</span>
      </div>
    </div>
  </div>

  <!-- Main Header -->
  <header class="bg-base-100 shadow-lg sticky top-0 z-40">
    <div class="container mx-auto">
      <!-- Desktop Header -->
      <div class="navbar px-4 py-3">
        <!-- Left: Logo & Menu -->
        <div class="navbar-start">
          <div class="dropdown">
            <label tabindex="0" class="btn btn-ghost lg:hidden">
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
            <ul
              tabindex="0"
              class="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow-lg bg-base-100 rounded-box w-64"
            >
              <li><router-link to="/">🏠 Home</router-link></li>
              <li><router-link to="/products">🛍️ Products</router-link></li>
              <li><router-link to="/categories">📦 Categories</router-link></li>
              <li><router-link to="/shops">🏪 Shops</router-link></li>
              <li><router-link to="/deals">🔥 Deals</router-link></li>
              <li v-if="!user.isLoggedIn">
                <router-link to="/login">🔐 Login</router-link>
              </li>
              <li v-if="!user.isLoggedIn">
                <router-link to="/register">📝 Register</router-link>
              </li>
            </ul>
          </div>
          <router-link to="/" class="btn btn-ghost normal-case text-xl font-bold hidden lg:flex">
            <span class="text-primary">🛒</span>
            <span>Marketplace</span>
          </router-link>
        </div>

        <!-- Center: Search (Desktop) -->
        <div class="navbar-center hidden lg:flex flex-1 max-w-2xl mx-4">
          <SearchBar />
        </div>

        <!-- Right: Actions -->
        <div class="navbar-end gap-2">
          <!-- Mobile Search Toggle -->
          <button
            @click="toggleMobileSearch"
            class="btn btn-ghost btn-circle lg:hidden"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <!-- Cart -->
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-circle">
              <div class="indicator">
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span
                  class="badge badge-sm badge-primary indicator-item"
                  v-if="cartStore.itemCount > 0"
                >
                  {{ cartStore.itemCount }}
                </span>
              </div>
            </label>
            <div
              tabindex="0"
              class="mt-3 card card-compact dropdown-content w-72 bg-base-100 shadow-2xl rounded-box z-50"
            >
              <div class="card-body">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold text-lg">Shopping Cart</span>
                  <span class="badge badge-primary">{{ cartStore.itemCount }}</span>
                </div>
                <div class="divider my-0"></div>
                <div class="flex justify-between items-center">
                  <span class="text-base-content/70">Subtotal:</span>
                  <span class="text-xl font-bold text-primary">
                    ${{ cartStore.subtotal.toFixed(2) }}
                  </span>
                </div>
                <div class="card-actions mt-4">
                  <router-link to="/cart" class="btn btn-primary btn-block">
                    View Cart
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Login Button (Not Logged In) -->
          <router-link
            v-if="!user.isLoggedIn"
            to="/login"
            class="btn btn-primary btn-sm hidden sm:flex"
          >
            Login
          </router-link>

          <!-- User Menu (Logged In) -->
          <div v-if="user.isLoggedIn" class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-circle avatar">
              <div class="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img :src="user.avatar" :alt="user.username" />
              </div>
            </label>
            <ul
              tabindex="0"
              class="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow-2xl bg-base-100 rounded-box w-64"
            >
              <li class="menu-title">
                <span class="text-base">{{ user.username }}</span>
              </li>
              <li>
                <router-link to="/profile" class="gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                  Profile
                </router-link>
              </li>
              <li>
                <router-link to="/orders" class="gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  My Orders
                </router-link>
              </li>
              <li v-if="user.role === 'seller'">
                <router-link to="/dashboard" class="gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Seller Dashboard
                </router-link>
              </li>
              <li v-if="user.role === 'admin'">
                <router-link to="/admin" class="gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                  </svg>
                  Admin Panel
                </router-link>
              </li>
              <div class="divider my-0"></div>
              <li>
                <a @click="logOut" class="gap-2 text-error">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                  </svg>
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Mobile Search Bar -->
      <div v-if="showMobileSearch" class="px-4 pb-4 lg:hidden">
        <SearchBar />
      </div>

      <!-- Desktop Navigation Links -->
      <nav class="hidden lg:flex border-t border-base-300">
        <div class="container mx-auto px-4">
          <ul class="menu menu-horizontal gap-1">
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/products">Products</router-link></li>
            <li><router-link to="/categories">Categories</router-link></li>
            <li><router-link to="/shops">Shops</router-link></li>
            <li><router-link to="/deals" class="text-error font-semibold">🔥 Deals</router-link></li>
          </ul>
        </div>
      </nav>
    </div>
  </header>

  <ToastNotification />
  
  <!-- Main Content -->
  <main class="container mx-auto px-4 py-6">
    <router-view :userID="user.id"></router-view>
  </main>
  <footer
    class="footer footer-center p-10 bg-base-200 text-base-content rounded shadow-md mt-4"
  >
    <div class="grid grid-flow-col gap-4">
      <a class="link link-hover">About us</a>
      <a class="link link-hover">Contact</a>
      <a class="link link-hover">Jobs</a>
      <a class="link link-hover">Press kit</a>
    </div>
    <div>
      <div class="grid grid-flow-col gap-4">
        <a
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="fill-current"
          >
            <path
              d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
            ></path></svg
        ></a>
        <a
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="fill-current"
          >
            <path
              d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
            ></path></svg
        ></a>
        <a
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="fill-current"
          >
            <path
              d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"
            ></path></svg
        ></a>
      </div>
    </div>
    <div>
      <p>Copyright © 2022 - All right reserved by ACME Industries Ltd</p>
    </div>
  </footer>
</template>

<style></style>
