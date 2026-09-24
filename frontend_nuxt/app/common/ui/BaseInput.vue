<script setup lang="ts">
  type InputType = 'password' | 'text'

  const {
    autocomplete = 'off',
    id,
    placeholder = '',
    type = 'text',
  } = defineProps<{
    autocomplete?: string
    error?: string
    id: string
    label: string
    placeholder?: string
    type?: InputType
  }>()

  const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="base-input">
    <label
      class="base-input__label"
      :for="id"
    >
      {{ label }}
    </label>

    <div class="base-input__wrapper">
      <slot name="icon-left"></slot>

      <input
        :id="id"
        v-model="model"
        class="base-input__input"
        :type="type"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
      />

      <slot name="icon-right"></slot>
    </div>

    <small
      v-if="error"
      class="base-input__error"
    >
      {{ error }}
    </small>
  </div>
</template>

<style scoped>
  .base-input {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .base-input__label {
    font-size: var(--text-14);
    color: var(--text-muted);
  }

  .base-input__wrapper {
    display: flex;
    align-items: center;
    height: 48px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-2);
    background-color: var(--bg-elevated);
    transition: border-color var(--duration-fast);

    &:focus-within {
      border-color: var(--brand-primary);
      outline: none;
    }
  }

  .base-input__input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
  }

  .base-input--disabled {
    @mixin control-disabled;
  }

  .base-input__error {
    color: var(--error);
  }

  .base-input__wrapper:has(+ .base-input__error) {
    border-color: var(--error);
  }
</style>
