<template>
  <FieldGroup>
    <FieldTitle class="font-semibold text-lg text-primary"> Cooking Steps: </FieldTitle>
    <FieldContent class="flex flex-col">
      <ol class="list-decimal marker:text-primary marker:font-bold">
        <li v-for="(step, idx) in steps" :key="step.order" class="ml-4 mb-3">
          <div class="flex gap-1">
            <Input v-model="step.step" placeholder="Do the..." />
            <Button
              v-if="idx !== steps.length - 1"
              variant="ghost"
              class="text-destructive w-4"
              @click="onRemove(idx)"
              ><X
            /></Button>
          </div>
        </li>
      </ol>
    </FieldContent>
  </FieldGroup>
</template>

<script setup lang="ts">
import type { CookingStep } from '@/api/recipes';
import { FieldContent, FieldGroup, FieldTitle } from '@/components/ui/field';
import { X } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { watch } from 'vue';

const steps = defineModel<CookingStep[]>('steps', { required: true });

const onRemove = (index: number) => {
  steps.value.splice(index, 1);
  steps.value.forEach((step, idx) => (step.order = idx));
};

watch(
  steps,
  (newSteps: CookingStep[]) => {
    const lastStep = newSteps[newSteps.length - 1];
    if (!lastStep || lastStep.step.trim()) {
      steps.value.push({ step: '', order: newSteps.length + 1 });
    }
  },
  { deep: true, immediate: true },
);
</script>
