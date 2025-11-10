<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/api/client";

const email = ref('')
const password = ref('')
const message = ref('')
const error = ref('')

const authStore = useAuthStore()
const router = useRouter()

const submitLogin = async () => {
  error.value = ''
  try {
    const res = await apiClient.post(
        '/auth/login',
        {
          username: email.value,
          password: password.value
        },
        {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    console.log(res)
    authStore.setSession(res.data)
    message.value = 'Login successfull!'
    router.push('/weeks')
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
    <p v-if="message" class="success">{{ message }}</p>
  </div>
</template>

<style scoped>

</style>
