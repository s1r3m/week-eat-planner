<template>
  <Card class="w-full max-w-lg lg:max-w-xl mx-auto mt-16">
    <CardHeader>
      <CardTitle class="text-brand-primary text-center text-2xl">Join us</CardTitle>
      <CardDescription class="text-center"> Create your account </CardDescription>
    </CardHeader>

    <CardContent>
      <form @submit.prevent="submitSignup">
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
                placeholder="Minimum 6 characters"
                autocomplete="new-password"
              />
            </Field>
          </FieldGroup>
          <Button type="submit" class="w-full">
            <template v-if="isSubmitting">
              <Spinner />
              Creating the account
            </template>
            <template v-else> Login </template>
          </Button>
        </FieldSet>
      </form>
    </CardContent>
    <FieldSeparator> or </FieldSeparator>
    <CardFooter class="flex flex-col gap-2">
      <Button variant="outline" class="w-full">Signup with Google</Button>
      <CardDescription>
        Already have an account?
        <router-link to="/login" class="font-semibold text-brand-primary hover:underline"
          >Login</router-link
        >
      </CardDescription>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Input } from '@/components/ui/input';
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

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const isSubmitting = ref(false);

const submitSignup = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  setTimeout('', 2000);
  try {
    const success = await authStore.signup(email.value, password.value);
    if (success) {
      router.push('/login');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped></style>
