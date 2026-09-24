<script setup lang="ts">
  import { useSignupForm } from '@/modules/auth/composables/useSignupForm'
  import BaseAlert from '@/common/ui/BaseAlert.vue'
  import BaseButton from '@/common/ui/BaseButton.vue'
  import BaseInput from '@/common/ui/BaseInput.vue'

  defineEmits<{
    submit: []
  }>()

  const { email, errors, isLoading, meta, password, serverError, username } =
    useSignupForm()

  const formId = useId()
  const revealed = ref<boolean>(false)
</script>

<template>
  <form
    :id="formId"
    class="auth-form"
    header="Register"
    description="Create your account"
    @submit.prevent="$emit('submit')"
  >
    <BaseAlert
      v-if="serverError"
      :message="serverError"
      variant="error"
      @close="serverError = null"
    />

    <BaseInput
      id="email"
      v-model="email"
      label="Email"
      autocomplete="username"
      placeholder="Enter email"
      :error="errors.email"
    />

    <BaseInput
      id="name"
      v-model="username"
      label="Username"
      placeholder="Enter username"
      :error="errors.username"
    />

    <BaseInput
      id="password"
      v-model="password"
      label="Password"
      :type="revealed ? 'text' : 'password'"
      placeholder="Enter password"
      autocomplete="new-password"
      :error="errors.password"
    >
      <template #icon-right>
        <BaseButton
          class="auth-form__toggle-btn"
          variant="icon"
          aria-label="Toggle password visibility"
          :aria-pressed="revealed"
          @click="revealed = !revealed"
        >
          <Icon
            :name="revealed ? 'lucide:eye' : 'lucide:eye-closed'"
            :size="24"
          />
        </BaseButton>
      </template>
    </BaseInput>

    <BaseButton
      type="submit"
      :disabled="!meta.valid || isLoading"
    >
      {{ isLoading ? 'Creating a profile...' : 'Register' }}
    </BaseButton>
  </form>
</template>

<style scoped>
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .auth-form__toggle-btn {
    color: var(--text-muted);
  }
</style>
