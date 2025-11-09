<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const message = ref('')
const error = ref('')

async function submitSignup() {
  message.value = ''
  error.value = ''
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    if (!res.ok) throw new Error('Signup failed')
    message.value = 'Account created successfully!'
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

</style>