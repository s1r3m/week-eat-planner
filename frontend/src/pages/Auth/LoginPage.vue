<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/api/client";
import { useClientIdStore } from '@/stores/clientId';
import { useAlertStore } from '@/stores/error';
import TheError from '@/components/common/ErrorNotification.vue';

const email = ref('')
const password = ref('')

const authStore = useAuthStore()
const clientIdStore = useClientIdStore()
const errorStore = useAlertStore()
const route = useRoute()
const router = useRouter()

const submitLogin = async () => {
  const params = new URLSearchParams({
    username: email.value,
    password: password.value,
    client_id: clientIdStore.getClientId(),
  })
  try {
    const res = await apiClient.post(
      '/auth/login', params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    authStore.setToken(res.data)
    const redirectPath = route.query.redirect || '/weeks'
    router.push(redirectPath as string)

  } catch (err: any) {
    errorStore.addError(err.response?.data?.detail || 'Login failed')
  }
}
</script>

<template>
  <div class="auth-container">
    <h2>Login</h2>
    <TheError />
    <form @submit.prevent="submitLogin">
      <label for="email">Email:</label>
      <input id="email" v-model="email" type="email" placeholder="Email" required />
      <label for="password">Password:</label>
      <input id="password" v-model="password" type="password" placeholder="Password" required minlength="6"/>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<style scoped>

</style>
