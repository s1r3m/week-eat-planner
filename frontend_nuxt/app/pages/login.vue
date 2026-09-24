<script setup lang="ts">
  import type { LoginForm } from '@/modules/auth/schemas/login'

  import { useLoginForm } from '@/modules/auth/composables/useLoginForm'
  import AuthCard from '@/modules/auth/ui/AuthCard.vue'
  import AuthLoginForm from '@/modules/auth/ui/AuthLoginForm.vue'
  import { getRedirectTarget } from '@/modules/auth/utils/session'

  definePageMeta({
    layout: 'default',
  })

  const { login } = useLoginForm()
  const route = useRoute()

  const onSubmit = async (payload: LoginForm) => {
    try {
      await login(payload)
    } catch {
      // serverError is already set by useSignupForm; swallow here
      return
    }

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
      <AuthLoginForm @submit="onSubmit" />
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
