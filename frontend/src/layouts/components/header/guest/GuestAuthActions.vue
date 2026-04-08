<template>
  <div class="flex gap-3">
    <template v-if="!isAuthenticated">
      <Button v-if="showLogin" variant="outline" size="sm" as-child>
        <router-link :to="{ name: 'login' }">Login</router-link>
      </Button>
      <Button v-if="showSignup" size="sm" as-child>
        <router-link :to="{ name: 'signup' }">Sign Up</router-link>
      </Button>
    </template>
    <template v-else>
      <Button variant="outline" size="sm" @click="logout">
        <Spinner v-if="isLoading" />
        {{ isLoading ? 'Logging Out...' : 'Log Out' }}
      </Button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { isAuthenticated, logoutMutation } from '@/api/auth';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import { useGuestAuthActions } from '@/features/auth/composables/useGuestAuthActions';
import { useMutation } from '@pinia/colada';

const { showLogin, showSignup } = useGuestAuthActions();
const { mutate: logout, isLoading } = useMutation(logoutMutation());
</script>
