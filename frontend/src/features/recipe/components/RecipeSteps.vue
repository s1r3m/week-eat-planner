<template>
  <div class="flex-1 bg-muted rounded-2xl shadow-lg p-6">
    <h2 class="font-semibold text-primary pb-3">How to cook:</h2>
    <ol class="list-decimal pl-6 marker:text-primary marker:font-bold space-y-3">
      <li v-for="step in steps" :key="step.order" class="leading-relaxed text-muted-foreground">
        {{ step.step }}
      </li>
    </ol>
  </div>
</template>
<script setup lang="ts">
import type { CookingStep } from '@/domain/recipe/models';

defineProps<{
  steps: CookingStep[];
}>();
</script>
