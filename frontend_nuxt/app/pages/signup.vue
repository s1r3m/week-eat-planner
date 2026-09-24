<script setup lang="ts">
  import { useSignupForm } from '@/modules/auth/composables/useSignupForm'
  import AuthCard from '@/modules/auth/ui/AuthCard.vue'
  import AuthSignupForm from '@/modules/auth/ui/AuthSignupForm.vue'

  definePageMeta({
    layout: 'default',
  })

  const { register } = useSignupForm()

  const onSubmit = async () => {
    try {
      await register()
      await navigateTo({ name: 'my-weeks' })
    } catch {
      // serverError is already set by useSignupForm; swallow here
    }
  }
</script>

<template>
  <div class="page">
    <AuthCard
      header="Join us"
      description="Register your account"
    >
      <AuthSignupForm @submit="onSubmit" />
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
