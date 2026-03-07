<template>
  <Card class="mx-6 max-w-lg lg:max-w-xl sm:mx-auto my-12">
    <CardHeader>
      <CardTitle class="text-brand-primary text-center text-2xl">{{ title }}</CardTitle>
      <CardDescription class="text-center"> {{ description }} </CardDescription>
    </CardHeader>

    <CardContent>
      <slot name="default" />
    </CardContent>

    <CardFooter class="flex flex-col gap-3">
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
