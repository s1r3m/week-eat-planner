<template>
  <div class="flex gap-3">
    <Button v-if="showLogin" variant="outline" size="sm" as-child>
      <router-link :to="{ name: 'login' }">Login</router-link>
    </Button>
    <Button v-if="showSignup" size="sm" as-child>
      <router-link :to="{ name: 'signup' }">Sign Up</router-link>
    </Button>
    <Button v-if="showLogout" variant="outline" size="sm" @click="logoutHandler"> Logout </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { useGuestAuthActions } from '@/features/auth/composables/useGuestAuthActions';

const { showLogin, showLogout, showSignup, logoutHandler } = useGuestAuthActions();
</script>
