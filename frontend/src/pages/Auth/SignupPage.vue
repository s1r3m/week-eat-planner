<script setup lang="ts">
import { ref } from 'vue'

import apiClient from "@/api/client";

const email = ref('')
const password = ref('')
const message = ref('')
const error = ref('')

const submitSignup = async () => {
  message.value = ''
  error.value = ''
  try {
    const res = await apiClient.post('/auth/signup', {
      email: email.value,
      password: password.value,
    })
    message.value = `Account ${res.data} successfully!`
  } catch (err) {
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
    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.success {
  color: #8ed307;
}

.error {
  color: #df1b1b;
}
</style>