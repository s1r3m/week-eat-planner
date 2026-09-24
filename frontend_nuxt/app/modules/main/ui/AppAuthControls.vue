<script setup lang="ts">
  import BaseButton from '@/common/ui/BaseButton.vue'
  import ModeSwitch from './ModeSwitch.vue'

  const route = useRoute()

  const showLogin = computed(() => route.name !== 'login')
  const showSignup = computed(() => route.name !== 'signup')
</script>

<template>
  <div class="header-controls">
    <ModeSwitch />

    <BaseButton
      v-if="showLogin"
      variant="outline"
      @click="navigateTo({ name: 'login' })"
    >
      Login
    </BaseButton>

    <BaseButton
      v-if="showSignup"
      @click="navigateTo({ name: 'signup' })"
    >
      Register
    </BaseButton>
  </div>
</template>

<style scoped>
  .header-controls {
    display: flex;
    align-items: center;
    padding: var(--space-4);
    gap: var(--space-4);
  }
</style>
