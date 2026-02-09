<template>
  <div class="flex gap-3">
    <Button v-if="showLogin" variant="outline" size="sm" as-child>
      <router-link to="/login">Login</router-link>
    </Button>
    <Button v-if="showSignup" size="sm" as-child>
      <router-link to="/signup">Sign Up</router-link>
    </Button>
    <Button v-if="authStore.isAuthenticated" variant="outline" size="sm" @click="authStore.logout">
      Logout
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import Button from '@/components/ui/button/Button.vue';

import { useAuthStore } from '@/features/auth/store/auth';

const authStore = useAuthStore();
const route = useRoute();
const showLogin = computed(() => !authStore.isAuthenticated && route.path !== '/login');
const showSignup = computed(() => !authStore.isAuthenticated && route.path !== '/signup');
</script>
