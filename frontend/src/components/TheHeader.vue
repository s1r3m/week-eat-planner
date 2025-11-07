<template>
  <header class="header">
    <router-link to="/" class="title-link">
      <img class="logo" src="@/assets/logo.png" alt="Logo">
      <h2>Week Eat Planner</h2>
    </router-link>
    <TheNavigation />
    <div class="auth-section">
      <router-link to="/login" class="btn ">Login</router-link>
      <router-link to="/signup" class="btn btn-primary">Sign Up</router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import TheNavigation from "@/components/TheNavigation.vue";
</script>

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
