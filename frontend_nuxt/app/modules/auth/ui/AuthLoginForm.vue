<script setup lang="ts">
  import BaseAlert from '@/common/ui/BaseAlert.vue'
  import BaseButton from '@/common/ui/BaseButton.vue'
  import BaseInput from '@/common/ui/BaseInput.vue'
  import { useLoginForm } from '@/modules/auth/composables/useLoginForm'

  const emits = defineEmits<{
    success: []
  }>()

  const {
    email,
    errors,
    handleSubmit,
    isLoading,
    login,
    meta,
    password,
    serverError,
  } = useLoginForm()

  const formId = useId()
  const revealed = ref<boolean>(false)

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values)
    } catch {
      // The form displays the error set by useLoginForm.
      return
    }

    emits('success')
  })
</script>

<template>
  <div class="auth-form">
    <form
      :id="formId"
      class="auth-form__form"
      novalidate
      @submit.prevent="onSubmit"
    >
      <BaseAlert
        v-if="serverError"
        :message="serverError"
        variant="error"
        @close="serverError = null"
      />

      <BaseInput
        v-model="email"
        label="Email"
        name="email"
        placeholder="Enter email"
        :error="errors.email"
      />

      <BaseInput
        v-model="password"
        label="Password"
        name="password"
        :type="revealed ? 'text' : 'password'"
        placeholder="Enter password"
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
        {{ isLoading ? 'Logging in... ' : 'Login' }}
      </BaseButton>
    </form>

    <div class="auth-form__link-wrapper">
      <span>Don't have an account?</span>

      <NuxtLink
        :to="{ name: 'signup' }"
        class="auth-form__link"
      >
        Register!
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .auth-form__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .auth-form__toggle-btn {
    color: var(--text-muted);
  }

  .auth-form__link-wrapper {
    display: flex;
    justify-content: center;
    gap: var(--space-1);
    font-size: var(--text-14);
    color: var(--text-muted);
  }

  .auth-form__link {
    color: var(--brand-primary);
  }
</style>
