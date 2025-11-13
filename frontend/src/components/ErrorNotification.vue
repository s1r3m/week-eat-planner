<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAlertStore } from '@/stores/error'

const errorStore = useAlertStore()
const displayedErrors = ref<string[]>([])
const isVisible = ref(false)

onMounted(() => {
  // Fetch errors when component mounts (called from pages)
  const errors = errorStore.getAllErrors()
  if (errors.length > 0) {
    displayedErrors.value = errors
    isVisible.value = true
    // Auto-hide after 5 seconds
    setTimeout(() => {
      isVisible.value = false
    }, 5000)
  }
})

const closeMessage = () => {
  isVisible.value = false
}
</script>

<template>
  <transition name="slide-down">
    <div v-if="isVisible" class="ui negative message error-container">
      <button class="ui icon button close-btn" @click="closeMessage">
        <i class="close icon"></i>
      </button>
      <div class="content">
        <div v-if="displayedErrors.length > 1" class="header">
          {{ displayedErrors.length }} errors occurred
        </div>
        <div v-else class="header">
          Error
        </div>
        <ul v-if="displayedErrors.length > 1" class="error-list">
          <li v-for="(error, idx) in displayedErrors" :key="idx">
            {{ error }}
          </li>
        </ul>
        <p v-else>
          {{ displayedErrors[0] }}
        </p>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.error-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 90%;
  max-width: 400px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #db2828;
}

.close-btn {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  background: none !important;
  border: none !important;
  cursor: pointer;
  padding: 0.5rem !important;
}

.content {
  padding-right: 2rem;
}

.header {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #db2828;
}

p {
  margin: 0;
  color: #333;
}

.error-list {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.error-list li {
  color: #333;
  margin-bottom: 0.25rem;
}

/* Slide-down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
