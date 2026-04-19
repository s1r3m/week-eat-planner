<template>
  <div class="login-page-container">
    <AuthCard v-if="!isAuthenticated" title="Welcome back" description="Login to your account">
      <template #default>
        <form @submit.prevent="handleLogin">
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
                  placeholder="Your password"
                />
              </Field>
            </FieldGroup>

            <Button type="submit" class="w-full cursor-pointer" :disabled="btnDisabled">
              <Spinner v-if="isLoading" />
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </Button>
          </FieldSet>
        </form>
        <FieldSeparator class="my-3"> Or </FieldSeparator>
        <AuthSocialButtons />
      </template>

      <template #footer>
        <CardDescription>
          Forgot your password?
          <router-link
            :to="{ name: ROUTE_NAMES.FORGOT_PASSWORD }"
            class="font-semibold text-brand-primary hover:underline"
          >
            Reset it
          </router-link>
        </CardDescription>
        <CardDescription>
          Don't have an account?
          <router-link
            :to="{ name: ROUTE_NAMES.SIGNUP }"
            class="font-semibold text-brand-primary hover:underline"
          >
            Register!
          </router-link>
        </CardDescription>
      </template>
    </AuthCard>

    <template v-else>
      <div class="space-y-6 mt-6 text-center text-base text-base-color">
        <p>You are already logged in.</p>
        <p class="text-sm text-muted-foreground">You can continue planning your meals!</p>
        <Button as-child>
          <router-link :to="{ name: ROUTE_NAMES.WEEKS }">Go to planning</router-link>
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AuthCard from '@/features/auth/components/AuthCard.vue';
import AuthSocialButtons from '@/features/auth/components/AuthSocialButtons.vue';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useMutation } from '@pinia/colada';
import { toast } from 'vue-sonner';
import { isAuthenticated, loginMutation } from '@/api/auth';

const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const btnDisabled = computed(
  () => isLoading.value || !email.value.length || password.value.length < 6,
);

const { mutateAsync: login, isLoading, error } = useMutation(loginMutation());

const handleLogin = async () => {
  const params = new URLSearchParams({ username: email.value, password: password.value });
  await login(params);
  if (!error.value) {
    toast.success('Logged in successfully');
    await router.push((route.query.redirect as string) || { name: ROUTE_NAMES.WEEKS });
  }
};
</script>
