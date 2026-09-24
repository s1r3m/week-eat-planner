<script setup lang="ts">
  import type { LoginForm } from '@/modules/auth/schemas/login'

  import { useLoginValidation } from '@/modules/auth/schemas/login'
  import { useLoginForm } from '@/modules/auth/composables/useLoginForm'
  import BaseAlert from '@/common/ui/BaseAlert.vue'
  import BaseInput from '@/common/ui/BaseInput.vue'
  import BaseButton from '@/common/ui/BaseButton.vue'

  const emits = defineEmits<{
    submit: [LoginForm]
  }>()

  const { email, errors, isLoading, meta, password, serverError } =
    useLoginForm()
  const { handleSubmit } = useLoginValidation()

  const formId = useId()
  const revealed = ref<boolean>(false)

  const onSubmit = handleSubmit((values: LoginForm) => {
    emits('submit', values)
  })
</script>

<template>
  <form
    :id="formId"
    class="auth-form"
    novalidate
    @submit.prevent="$emit('submit', { email, password } satisfies LoginForm)"
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
      name="email"
      placeholder="Enter email"
      :error="errors.email"
    />

    <BaseInput
      id="password"
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
