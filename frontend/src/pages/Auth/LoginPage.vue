<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from "@/stores/userAuth";

const email = ref('')
const password = ref('')
const error = ref('')

const authStore = useAuthStore()

const submitLogin = async () => {
  error.value = ''
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: email.value,
        password: password.value,
      })
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Login failed' }))
        throw new Error(errorData.detail || 'An unknown error occurred.')
    }
    const data = await res.json()
    console.log(`login response ${JSON.stringify(data)}`)
    console.log(`login token ${data.access_token}`)
    console.log(`login type ${data.token_type}`)

    authStore.access_token = data.access_token
    alert('Login successfully!')
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <div class="auth-container">
    <h2>Login</h2>
    <form @submit.prevent="submitLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required minlength="6"/>
      <button type="submit">Login</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>

</style>
