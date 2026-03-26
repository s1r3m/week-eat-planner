<template>
  <div id="not-found-container" class="max-w-280 flex-col justify-center items-center">
    <h1 class="text-2xl text-destructive">Looks like the page you're looking for does not exist</h1>
    <p class="text-8xl text-destructive">404</p>
    <Button as-child>
      <router-link :to="{ name: ROUTE_NAMES.HOME }"> Go back home </router-link>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { Button } from '@/components/ui/button';
</script>
