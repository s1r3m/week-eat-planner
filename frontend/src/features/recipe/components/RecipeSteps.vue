<template>
  <Card class="flex-1 px-6">
    <CardTitle class="font-semibold text-primary">How to cook:</CardTitle>
    <CardContent>
      <ol class="list-decimal marker:text-primary marker:font-bold space-y-3">
        <li v-for="step in steps" :key="step.order" class="leading-relaxed text-muted-foreground">
          {{ step.step }}
        </li>
      </ol>
    </CardContent>
  </Card>
</template>
<script setup lang="ts">
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import type { CookingStep } from '@/domain/recipe/models';

defineProps<{
  steps: CookingStep[];
}>();
</script>
