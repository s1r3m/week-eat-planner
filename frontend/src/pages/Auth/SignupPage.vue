<script setup lang="ts">
import { ref } from 'vue'

import apiClient from "@/api/client";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')

const authStore = useAuthStore()
const router = useRouter()


const submitSignup: () => Promise<void> = async () => {
  error.value = ''
  try {
    const res = await apiClient.post('/auth/signup', {
      email: email.value,
      password: password.value,
    })
    if (res.status !== 201) {
      throw new Error(`Signup failed with status ${res.status}: ${res.data}`)
    }
    authStore.setToken(res.data)
    router.push('/login')
  } catch (err: any) {
    error.value = err.message
  }
}
</script>

<template>
  <div class="auth-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="submitSignup">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" minlength="6" required />
      <button type="submit">Create Account</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.error {
  color: #df1b1b;
}
</style>