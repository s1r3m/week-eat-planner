<template>
  <Card class="m-6 max-w-lg lg:max-w-xl sm:mx-auto">
    <CardHeader>
      <CardTitle class="text-primary text-center text-headline-sm">{{ title }}</CardTitle>
      <CardDescription class="text-center text-body-md text-on-surface-variant">
        {{ description }}
      </CardDescription>
    </CardHeader>

    <CardContent class="flex flex-col gap-3 mb-6">
      <slot name="default" />
    </CardContent>

    <CardFooter class="flex flex-col gap-3 mb-6">
      <slot name="footer" />
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

defineProps<{
  title: string;
  description: string;
}>();
</script>
