<template>
  <Card class="w-full max-w-lg lg:max-w-xl mx-auto mt-16">
    <CardHeader>
      <CardTitle class="text-brand-primary text-center text-2xl">Welcome back</CardTitle>
      <CardDescription class="text-center"> Login to your account </CardDescription>
    </CardHeader>

    <CardContent>
      <form @submit.prevent="submitLogin">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel for="email">Email</FieldLabel>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="your@email.com"
                autocomplete="email"
              />
            </Field>
            <Field>
              <FieldLabel for="password">Password</FieldLabel>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="Type your password"
                autocomplete="current-password"
              />
            </Field>
          </FieldGroup>
          <Button type="submit" class="w-full">
            <template v-if="isSubmitting">
              <Spinner />
              Logging in
            </template>
            <template v-else> Login </template>
          </Button>
        </FieldSet>
      </form>
    </CardContent>
    <FieldSeparator>or</FieldSeparator>
    <CardFooter class="flex flex-col gap-2">
      <Button variant="outline" class="w-full">Login with Google</Button>
      <CardDescription class="mt-2">
        Forgot your password?
        <router-link to="/" class="font-semibold text-brand-primary hover:underline"
          >Reset it</router-link
        >
      </CardDescription>
      <CardDescription>
        Don't have an account?
        <router-link to="/signup" class="font-semibold text-brand-primary hover:underline"
          >Sign up</router-link
        >
      </CardDescription>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/auth';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const isSubmitting = ref(false);

const submitLogin = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const success = await authStore.login(email.value, password.value);
    if (!success) return;
    const redirectParam = route.query.redirect;
    const redirectPath = typeof redirectParam === 'string' ? redirectParam : '/weeks';
    router.push(redirectPath);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped></style>
