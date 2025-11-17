<template>
  <header class="sticky inset-0 z-10 bg-surface-raised py-4">
    <section class="container-center flex items-center justify-between pr-2">
      <router-link to="/" class="flex items-center gap-3">
        <img class="max-w-14" src="@/assets//logo.png" alt="logo" />
        <h1 class="text-3xl font-mediumß">Week Eat Planner</h1>
      </router-link>

      <nav class="hidden md:block space-x-8 text-xl">
        <router-link to="/weeks" class="hover:opacity-65">My Weeks</router-link>
        <router-link to="/recipes" class="hover:opacity-65">Recipes</router-link>
        <router-link to="/recipes" class="hover:opacity-65">Recipes</router-link>
      </nav>

      <div>
        <button id="mobile-open-menu" class="text-3xl hover:opacity-65 md:hidden cursor-pointer">
          &#9776;
        </button>
      </div>

      <div class="hidden md:block">
        <div v-if="!authStore.isAuthenticated" class="flex justify-between gap-4">
          <router-link to="/login">
            <button class="btn">Login</button>
          </router-link>
          <router-link to="/signup">
            <button class="btn btn-primary">Sign Up</button>
          </router-link>
        </div>
        <div v-else class="flex justify-between gap-4">
          <router-link to="/profile">
            <button class="btn">Profile</button>
          </router-link>
          <button class="btn" @click="logout">Logout</button>
        </div>
      </div>
    </section>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import apiClient from '@/api/client';

const authStore = useAuthStore();
const router = useRouter();

const logout: () => Promise<void> = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (err: any) {
    // Doesn't matter if logout request fails
    console.error('Logout request failed:', err);
  }

  authStore.clearToken();
  router.push('/');
};
</script>

<style scoped>
/* Scoped styles can be added here if needed, but the core layout is now handled by Tailwind classes. */
</style>
