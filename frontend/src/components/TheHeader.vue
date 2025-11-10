<script setup lang="ts">
import TheNavigation from "@/components/TheNavigation.vue"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from 'vue-router'
import apiClient from "@/api/client"

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  const res = await apiClient.post('/auth/logout')
  console.log(`Status ${res.status}`)
  authStore.clearToken()
  router.push('/')
}

</script>

<template>
  <header class="header">
    <router-link to="/" class="title-link">
      <img class="logo" src="@/assets/logo.png" alt="Logo">
      <h2>Week Eat Planner</h2>
    </router-link>
    <TheNavigation />
    <div class="auth-section">
      <div v-if="!authStore.isAuthenticated">
        <router-link to="/login">
          <button class="btn">Login</button>
        </router-link>
        <router-link to="/signup">
          <button class="btn btn-primary">Sign Up</button>
        </router-link>
      </div>
      <div v-else>
        <router-link to="/profile">
          <button class="btn">Profile</button>
        </router-link>
        <button class="btn btn-primary" @click="logout">Logout</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: #1a73e8;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
}

.logo {
  height: 5rem;
  width: 5rem;;
}
</style>
