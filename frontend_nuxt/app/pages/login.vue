<script setup lang="ts">
  import AuthCard from '@/modules/auth/ui/AuthCard.vue'
  import AuthLoginForm from '@/modules/auth/ui/AuthLoginForm.vue'
  import { getRedirectTarget } from '@/modules/auth/utils/session'

  definePageMeta({
    layout: 'default',
  })

  const route = useRoute()

  const onSuccess = async () => {
    await navigateTo(getRedirectTarget(route.query.redirect))
  }
</script>

<template>
  <div class="page">
    <AuthCard
      class=""
      header="Welcome back"
      description="Login to your account"
    >
      <AuthLoginForm @success="onSuccess" />
    </AuthCard>
  </div>
</template>

<style scoped>
  .page {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: var(--space-8);
  }
</style>
