<template>
  <Button variant="outline" class="w-full cursor-pointer">
    {{ config.googleButton }}
  </Button>
  <CardDescription :class="config.showForgot ? 'mt-2' : ''">
    <template v-if="config.showForgot">
      Forgot your password?
      <router-link to="/" class="font-semibold text-brand-primary hover:underline">
        Reset it
      </router-link>
    </template>
  </CardDescription>
  <CardDescription>
    {{ config.toggleText }}
    <router-link :to="config.toggleRoute" class="font-semibold text-brand-primary hover:underline">
      {{ config.toggleLinkText }}
    </router-link>
  </CardDescription>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { type AuthVariants, authConfig } from '.';

interface Props {
  variant: NonNullable<AuthVariants['variant']>;
}
const props = defineProps<Props>();

const config = computed(() => authConfig[props.variant].footer);
</script>
