<script setup>
import { useNotificationStore } from '@/stores/notification'
import { computed } from 'vue'

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.activeNotifications)

const getAlertClass = (type) => {
  const baseClass = 'alert shadow-lg'
  switch (type) {
    case 'success':
      return `${baseClass} alert-success`
    case 'error':
      return `${baseClass} alert-error`
    case 'warning':
      return `${baseClass} alert-warning`
    case 'info':
      return `${baseClass} alert-info`
    case 'loading':
      return `${baseClass} alert-info`
    default:
      return baseClass
  }
}

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    case 'error':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    case 'warning':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`
    case 'info':
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    case 'loading':
      return `<svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`
    default:
      return ''
  }
}

const closeNotification = (id) => {
  notificationStore.remove(id)
}
</script>

<template>
  <div class="toast toast-top toast-end z-50">
    <TransitionGroup name="toast">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="getAlertClass(notification.type)"
      >
        <div v-html="getIcon(notification.type)"></div>
        <div class="flex-1">
          <h3 v-if="notification.title" class="font-bold">
            {{ notification.title }}
          </h3>
          <div class="text-sm">{{ notification.message }}</div>
        </div>
        <button
          v-if="notification.closable"
          @click="closeNotification(notification.id)"
          class="btn btn-sm btn-circle btn-ghost"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>