<template>
  <div class="signup-page-container">
    <AuthCard v-if="!isAuthenticated" title="Join us" description="Create your account">
      <template #default>
        <form @submit.prevent="handleSignup">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel for="email"> Email </FieldLabel>
                <Input id="email" v-model="email" type="email" placeholder="your@email.com" />
              </Field>
              <Field>
                <FieldLabel for="username"> Username </FieldLabel>
                <Input id="username" v-model="username" type="text" placeholder="Your username" />
              </Field>
              <Field>
                <FieldLabel for="password"> Password </FieldLabel>
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="Your password"
                />
              </Field>
            </FieldGroup>

            <Button type="submit" class="w-full cursor-pointer" :disabled="btnDisabled">
              <Spinner v-if="isLoading" />
              {{ isLoading ? 'Signing up...' : 'Sign up' }}
            </Button>
            <FieldSeparator> Or </FieldSeparator>
          </FieldSet>
        </form>
      </template>

      <template #footer>
        <AuthFooter>
          <CardDescription>
            Already have an account?
            <router-link
              :to="{ name: ROUTE_NAMES.LOGIN }"
              class="font-semibold text-brand-primary hover:underline"
            >
              Log in!
            </router-link>
          </CardDescription>
        </AuthFooter>
      </template>
    </AuthCard>

    <div v-else class="space-y-4 mt-4 text-center text-base text-base-color">
      <p>You are already logged in.</p>
      <p class="text-sm text-muted-foreground">You can continue planning your meals!</p>
      <Button>
        <router-link :to="{ name: ROUTE_NAMES.WEEKS }">Go to planning</router-link>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { isAuthenticated, loginMutation, signupMutation } from '@/api/auth';
import { useMutation } from '@pinia/colada';

import AuthFooter from '@/features/auth/components/AuthFooter.vue';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import AuthCard from '@/features/auth/components/AuthCard.vue';

const router = useRouter();
const email = ref('');
const username = ref('');
const password = ref('');
const btnDisabled = computed(() => !isLoading || !email.value.length || password.value.length < 6);

const { mutateAsync: signup, isLoading, error } = useMutation(signupMutation());
const { mutateAsync: login } = useMutation(loginMutation());

const handleSignup = async () => {
  await signup({ email: email.value, username: username.value, password: password.value });
  if (!error.value) {
    const params = new URLSearchParams({ username: email.value, password: password.value });
    await login(params);
    await router.push({ name: ROUTE_NAMES.WEEKS });
  }
};
</script>
