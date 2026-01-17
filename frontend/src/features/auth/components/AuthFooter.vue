<template>
  <Button variant="outline" class="w-full"> Sign in with Google </Button>
  <Button variant="outline" class="w-full"> Sign in with Facebook </Button>

  <slot />
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
</script>
