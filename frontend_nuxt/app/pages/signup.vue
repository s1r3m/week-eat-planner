<script setup lang="ts">
  import AuthCard from '@/modules/auth/ui/AuthCard.vue'
  import AuthSignupForm from '@/modules/auth/ui/AuthSignupForm.vue'

  definePageMeta({
    layout: 'default',
  })

  const onSuccess = async () => {
    await navigateTo({ name: 'my-weeks' })
  }
</script>

<template>
  <div class="page">
    <AuthCard
      header="Join us"
      description="Register your account"
    >
      <AuthSignupForm @success="onSuccess" />
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
