<script setup lang="ts">
import { ref } from 'vue'
import TheError from '@/components/ErrorNotification.vue';

import apiClient from "@/api/client";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from 'vue-router'
import { useAlertStore } from '@/stores/error';

const email = ref('')
const password = ref('')

const authStore = useAuthStore()
const errorStore = useAlertStore()
const router = useRouter()


const submitSignup: () => Promise<void> = async () => {
  try {
    const res = await apiClient.post('/auth/signup', {
      email: email.value,
      password: password.value,
    })
    if (res.status == 201) router.push('/login')
  } catch (err: any) {
    errorStore.addError(err.message)
  }
}
</script>

<template>
  <div class="auth-container">
    <h2>Sign Up</h2>
    <TheError />
    <form v-if="!authStore.isAuthenticated" @submit.prevent="submitSignup">
      <label for="email">Email:</label>
      <input v-model="email" type="email" placeholder="Email" required />
      <label for="password">Password:</label>
      <input v-model="password" type="password" placeholder="Password" minlength="6" required />
      <button type="submit">Create Account</button>
    </form>
    <div v-else>
      <p>You are already logged in.</p>
      // TODO: Logout button when it is in a separate component.
    </div>
  </div>
</template>

<style scoped>
.error {
  color: #df1b1b;
}
</style>