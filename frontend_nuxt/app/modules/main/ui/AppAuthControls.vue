<script setup lang="ts">
  import BaseButton from '@/common/ui/BaseButton.vue'
  import ModeSwitch from '@/modules/main/ui/ModeSwitch.vue'

  const emits = defineEmits<{
    navigate: []
  }>()

  const route = useRoute()

  const showLogin = computed(() => route.name !== 'login')
  const showSignup = computed(() => route.name !== 'signup')

  const navigate = async (name: string) => {
    await navigateTo({ name })
    emits('navigate')
  }
</script>

<template>
  <div class="header-controls">
    <ModeSwitch />

    <BaseButton
      v-if="showLogin"
      variant="secondary"
      @click="navigate('login')"
    >
      Login
    </BaseButton>

    <BaseButton
      v-if="showSignup"
      @click="navigate('signup')"
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
