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
      <Button variant="outline" size="sm" @click="logout">
        {{ isLoading ? 'Logging out...' : 'Log out' }}
      </Button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';
import { useGuestAuthActions } from '@/features/auth/composables/useGuestAuthActions';

const { showLogin, isLogged, showSignup, logoutHandler } = useGuestAuthActions();
const { call: logout, isLoading } = useAsyncCall(logoutHandler);
</script>
