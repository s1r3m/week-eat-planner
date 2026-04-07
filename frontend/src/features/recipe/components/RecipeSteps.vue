<template>
  <div class="flex-1 space-y-3">
    <h2 class="font-semibold text-primary">How to cook:</h2>
    <div>
      <ol class="list-decimal marker:text-primary marker:font-bold space-y-3">
        <li
          v-for="step in steps"
          :key="step.order"
          class="leading-relaxed text-muted-foreground ml-5"
        >
          {{ step.step }}
        </li>
      </ol>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { CookingStep } from '@/api/recipes';

defineProps<{
  steps: CookingStep[];
}>();
</script>
