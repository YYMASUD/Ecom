import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: []
  }),

  getters: {
    activeNotifications: (state) => state.notifications
  },

  actions: {
    // Add a notification
    add(notification) {
      const id = Date.now() + Math.random()
      const newNotification = {
        id,
        type: notification.type || 'info',
        message: notification.message,
        title: notification.title || '',
        duration: notification.duration || 5000,
        closable: notification.closable !== false
      }

      this.notifications.push(newNotification)

      // Auto remove after duration
      if (newNotification.duration > 0) {
        setTimeout(() => {
          this.remove(id)
        }, newNotification.duration)
      }

      return id
    },

    // Remove a notification
    remove(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },

    // Clear all notifications
    clear() {
      this.notifications = []
    },

    // Convenience methods for different types
    success(message, title = 'Success', duration = 5000) {
      return this.add({
        type: 'success',
        message,
        title,
        duration
      })
    },

    error(message, title = 'Error', duration = 7000) {
      return this.add({
        type: 'error',
        message,
        title,
        duration
      })
    },

    warning(message, title = 'Warning', duration = 6000) {
      return this.add({
        type: 'warning',
        message,
        title,
        duration
      })
    },

    info(message, title = 'Info', duration = 5000) {
      return this.add({
        type: 'info',
        message,
        title,
        duration
      })
    },

    // Show loading notification (doesn't auto-dismiss)
    loading(message, title = 'Loading') {
      return this.add({
        type: 'loading',
        message,
        title,
        duration: 0,
        closable: false
      })
    }
  }
})

// Made with Bob
