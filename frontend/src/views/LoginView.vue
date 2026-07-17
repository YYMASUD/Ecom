<script>
import axios from "axios";
import { useUserStore } from "@/stores/user";
import { useCartStore } from "@/stores/cart";
import { useNotificationStore } from "@/stores/notification";

export default {
  setup() {
    const userStore = useUserStore();
    const cartStore = useCartStore();
    const notification = useNotificationStore();
    return { userStore, cartStore, notification };
  },

  data() {
    return {
      email: "",
      password: "",
      loading: false,
      errorMessage: "",
      showPassword: false,
    };
  },

  methods: {
    async login() {
      if (!this.email || !this.password) {
        this.errorMessage = "Please enter your email and password.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "post",
          url: "/user/login",
          data: {
            email: this.email,
            password: this.password,
          },
        });

        const token = response.data?.token ?? response.data;
        if (!token || typeof token !== "string") {
          this.errorMessage = "Login failed: Invalid server response.";
          return;
        }

        await this.userStore.setToken(token);
        await this.cartStore.syncWithBackend();

        this.notification.success("Welcome back! Logged in successfully.");

        const redirect = this.$route.query.redirect || "/";
        this.$router.push(redirect);
      } catch (e) {
        const msg = e.response?.data?.message || "Invalid email or password.";
        this.errorMessage = msg;
        this.notification.error(msg);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12" style="background:#EAEDED">
    <div class="w-full max-w-md">

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

        <!-- Top brand bar -->
        <div class="px-8 pt-8 pb-6 text-center border-b border-gray-100">
          <router-link to="/" class="inline-flex items-center gap-2 mb-6 group">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:#FF6B35">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <span class="font-extrabold text-xl text-gray-900">ShopHub</span>
          </router-link>
          <h1 class="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p class="text-sm text-gray-500 mt-1">Sign in to your ShopHub account</p>
        </div>

        <div class="px-8 py-7">

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span class="text-sm text-red-700">{{ errorMessage }}</span>
          </div>

          <!-- Form -->
          <form @submit.prevent="login" class="space-y-5">

            <!-- Email -->
            <div>
              <label for="login-email" class="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                id="login-email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 placeholder-gray-400 transition-all"
              />
            </div>

            <!-- Password -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="login-password" class="text-sm font-semibold text-gray-700">Password</label>
                <a class="text-xs sh-link font-medium">Forgot password?</a>
              </div>
              <div class="relative">
                <input
                  id="login-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 placeholder-gray-400 pr-10 transition-all"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="btn-cta w-full py-3.5 rounded-xl font-bold text-base mt-2"
              :class="{ 'opacity-70 cursor-not-allowed': loading }"
              :disabled="loading"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center gap-4 my-6">
            <div class="flex-1 border-t border-gray-100"></div>
            <span class="text-xs text-gray-400 font-medium">New to ShopHub?</span>
            <div class="flex-1 border-t border-gray-100"></div>
          </div>

          <!-- Register link -->
          <router-link
            to="/register"
            class="block w-full text-center py-3 rounded-xl border-2 text-sm font-bold transition-all"
            style="border-color:#FF6B35;color:#FF6B35"
          >
            Create your ShopHub account
          </router-link>
        </div>
      </div>

      <!-- Footer note -->
      <p class="text-center text-xs text-gray-500 mt-5">
        By signing in, you agree to ShopHub's
        <a class="sh-link">Terms of Service</a> and
        <a class="sh-link">Privacy Policy</a>
      </p>
    </div>
  </div>
</template>
