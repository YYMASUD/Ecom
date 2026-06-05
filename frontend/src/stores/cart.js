import { defineStore } from 'pinia'
import axios from 'axios'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    synced: false
  }),

  getters: {
    // Total number of items in cart
    itemCount: (state) => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },

    // Subtotal price
    subtotal: (state) => {
      return state.items.reduce((sum, item) => {
        const price = item.product?.price || item.price || 0
        return sum + (price * item.quantity)
      }, 0)
    },

    // Cart items with product details
    cartItems: (state) => state.items,

    // Check if cart is empty
    isEmpty: (state) => state.items.length === 0,

    // Get item by product ID
    getItemByProductId: (state) => (productId) => {
      return state.items.find(item => 
        item.product?._id === productId || item.product === productId
      )
    }
  },

  actions: {
    // Load cart from localStorage (for guest users)
    loadFromLocalStorage() {
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          this.items = JSON.parse(savedCart)
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        this.items = []
      }
    },

    // Save cart to localStorage
    saveToLocalStorage() {
      try {
        localStorage.setItem('cart', JSON.stringify(this.items))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    },

    // Fetch cart from backend (for logged-in users)
    async fetchCart() {
      const userStore = useUserStore()
      
      if (!userStore.getToken) {
        this.loadFromLocalStorage()
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: 'get',
          url: '/cart',
          headers: {
            Authorization: `Bearer ${userStore.getToken}`
          }
        })

        if (response.data.success) {
          this.items = response.data.cart.items || []
          this.synced = true
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
        this.error = error.response?.data?.message || 'Failed to fetch cart'
        // Fallback to localStorage
        this.loadFromLocalStorage()
      } finally {
        this.loading = false
      }
    },

    // Add item to cart
    async addToCart(product, quantity = 1) {
      const userStore = useUserStore()
      this.loading = true
      this.error = null

      try {
        if (userStore.getToken) {
          // Add to backend cart
          const response = await axios({
            baseURL: import.meta.env.VITE_BACKENDURL,
            method: 'post',
            url: '/cart/add',
            headers: {
              Authorization: `Bearer ${userStore.getToken}`
            },
            data: {
              productId: product._id,
              quantity
            }
          })

          if (response.data.success) {
            this.items = response.data.cart.items || []
            return { success: true, message: 'Item added to cart' }
          }
        } else {
          // Add to localStorage cart
          const existingItem = this.items.find(item => 
            item.product?._id === product._id || item.productId === product._id
          )

          if (existingItem) {
            existingItem.quantity += quantity
          } else {
            this.items.push({
              product: product,
              productId: product._id,
              quantity,
              price: product.price,
              addedAt: new Date()
            })
          }

          this.saveToLocalStorage()
          return { success: true, message: 'Item added to cart' }
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        this.error = error.response?.data?.message || 'Failed to add item to cart'
        return { 
          success: false, 
          message: this.error,
          availableQuantity: error.response?.data?.availableQuantity
        }
      } finally {
        this.loading = false
      }
    },

    // Update item quantity
    async updateQuantity(productId, quantity) {
      const userStore = useUserStore()
      this.loading = true
      this.error = null

      try {
        if (userStore.getToken) {
          // Update in backend
          const response = await axios({
            baseURL: import.meta.env.VITE_BACKENDURL,
            method: 'put',
            url: `/cart/update/${productId}`,
            headers: {
              Authorization: `Bearer ${userStore.getToken}`
            },
            data: { quantity }
          })

          if (response.data.success) {
            this.items = response.data.cart.items || []
            return { success: true }
          }
        } else {
          // Update in localStorage
          const item = this.items.find(item => 
            item.product?._id === productId || item.productId === productId
          )

          if (item) {
            if (quantity <= 0) {
              this.items = this.items.filter(i => 
                i.product?._id !== productId && i.productId !== productId
              )
            } else {
              item.quantity = quantity
            }
            this.saveToLocalStorage()
          }
          return { success: true }
        }
      } catch (error) {
        console.error('Error updating cart:', error)
        this.error = error.response?.data?.message || 'Failed to update cart'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    // Remove item from cart
    async removeFromCart(productId) {
      const userStore = useUserStore()
      this.loading = true
      this.error = null

      try {
        if (userStore.getToken) {
          // Remove from backend
          const response = await axios({
            baseURL: import.meta.env.VITE_BACKENDURL,
            method: 'delete',
            url: `/cart/remove/${productId}`,
            headers: {
              Authorization: `Bearer ${userStore.getToken}`
            }
          })

          if (response.data.success) {
            this.items = response.data.cart.items || []
            return { success: true }
          }
        } else {
          // Remove from localStorage
          this.items = this.items.filter(item => 
            item.product?._id !== productId && item.productId !== productId
          )
          this.saveToLocalStorage()
          return { success: true }
        }
      } catch (error) {
        console.error('Error removing from cart:', error)
        this.error = error.response?.data?.message || 'Failed to remove item'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    // Clear entire cart
    async clearCart() {
      const userStore = useUserStore()
      this.loading = true
      this.error = null

      try {
        if (userStore.getToken) {
          // Clear backend cart
          const response = await axios({
            baseURL: import.meta.env.VITE_BACKENDURL,
            method: 'delete',
            url: '/cart/clear',
            headers: {
              Authorization: `Bearer ${userStore.getToken}`
            }
          })

          if (response.data.success) {
            this.items = []
            return { success: true }
          }
        } else {
          // Clear localStorage cart
          this.items = []
          this.saveToLocalStorage()
          return { success: true }
        }
      } catch (error) {
        console.error('Error clearing cart:', error)
        this.error = error.response?.data?.message || 'Failed to clear cart'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    // Sync localStorage cart with backend when user logs in
    async syncWithBackend() {
      const userStore = useUserStore()
      
      if (!userStore.getToken || this.synced) {
        return
      }

      // Get items from localStorage
      const localItems = [...this.items]
      
      if (localItems.length === 0) {
        await this.fetchCart()
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: 'post',
          url: '/cart/sync',
          headers: {
            Authorization: `Bearer ${userStore.getToken}`
          },
          data: {
            items: localItems.map(item => ({
              productId: item.product?._id || item.productId,
              quantity: item.quantity
            }))
          }
        })

        if (response.data.success) {
          this.items = response.data.cart.items || []
          this.synced = true
          // Clear localStorage after successful sync
          localStorage.removeItem('cart')
        }
      } catch (error) {
        console.error('Error syncing cart:', error)
        this.error = error.response?.data?.message || 'Failed to sync cart'
      } finally {
        this.loading = false
      }
    },

    // Reset cart state (on logout)
    resetCart() {
      this.items = []
      this.loading = false
      this.error = null
      this.synced = false
      localStorage.removeItem('cart')
    }
  }
})

// Made with Bob
