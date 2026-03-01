<template>
  <div class="flex gap-3">
    <template v-if="!isLogged">
      <Button v-if="showLogin" variant="outline" size="sm" as-child>
        <router-link :to="{ name: 'login' }">Login</router-link>
      </Button>
      <Button v-if="showSignup" size="sm" as-child>
        <router-link :to="{ name: 'signup' }">Sign Up</router-link>
      </Button>
    </template>
    <template v-else>
      <Button variant="outline" size="sm" @click="logoutHandler"> Logout </Button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { useGuestAuthActions } from '@/features/auth/composables/useGuestAuthActions';

const { showLogin, isLogged, showSignup, logoutHandler } = useGuestAuthActions();
</script>
