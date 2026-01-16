<template>
  <template v-if="!authStore.accessToken">
    <form @submit.prevent="$emit('submit', email, password)">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel for="email"> Email </FieldLabel>
            <Input id="email" v-model="email" type="email" placeholder="your@email.com" />
          </Field>
          <Field>
            <FieldLabel for="password"> Password </FieldLabel>
            <Input
              id="password"
              v-model="password"
              type="password"
              :placeholder="variant === 'login' ? 'Minimum 6 characters' : 'Your password'"
            />
          </Field>
        </FieldGroup>
        <Button
          type="submit"
          class="w-full"
          :class="{ 'cursor-not-allowed': btnDisabled, 'cursor-pointer': !btnDisabled }"
          :disabled="btnDisabled"
        >
          <template v-if="submitting">
            <Spinner />
            {{ variant === 'login' ? 'Logging in' : 'Signing ...' }}
          </template>
          <template v-else> {{ variant === 'login' ? 'Login' : 'Sign up' }} </template>
        </Button>
        <FieldSeparator> or </FieldSeparator>
      </FieldSet>
    </form>
  </template>

  <template v-else>
    <div class="space-y-4 mt-4 text-center text-base text-base-color">
      <p>You are already logged in.</p>
      <p class="text-sm text-muted">You can continue planning your meals!</p>
      <Button>
        <router-link to="/weeks">Go to planning</router-link>
      </Button>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/features/auth/store/auth';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const btnDisabled = computed(() => !email.value.length || password.value.length < 6);

defineProps<{
  variant: 'login' | 'signup';
  submitting: boolean;
}>();

defineEmits<{ submit: [string, string] }>();
</script>

<style scoped></style>
