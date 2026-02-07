<template>
  <Button variant="outline" class="w-full"> Continue with Google </Button>
  <Button variant="outline" class="w-full"> Continue with Facebook </Button>

  <slot />
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
</script>
