<template>
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
      <Button type="submit" class="w-full cursor-pointer" :disabled="btnDisabled">
        <template v-if="submitting">
          <Spinner />
          {{ variant === 'login' ? 'Logging in...' : 'Signing up...' }}
        </template>
        <template v-else> {{ variant === 'login' ? 'Login' : 'Sign up' }} </template>
      </Button>
      <FieldSeparator> Or </FieldSeparator>
    </FieldSet>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

const email = ref('');
const password = ref('');

const btnDisabled = computed(
  () => props.submitting || !email.value.length || password.value.length < 6,
);

const props = defineProps<{
  variant: 'login' | 'signup';
  submitting: boolean;
}>();

defineEmits<{ submit: [string, string] }>();
</script>
