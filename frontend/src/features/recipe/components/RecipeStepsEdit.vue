<template>
  <FieldGroup>
    <FieldTitle class="font-semibold text-lg text-primary"> Cooking Steps: </FieldTitle>
    <FieldContent class="flex flex-col">
      <ol class="list-decimal marker:text-primary marker:font-bold">
        <li v-for="(step, idx) in steps" :key="step.order" class="ml-4 mb-3">
          <div class="flex gap-1">
            <Input v-model="step.step" placeholder="Do the..." />
            <Button
              variant="ghost"
              class="text-destructive w-4 h-12 rounded-sm"
              :class="{ invisible: idx === steps.length - 1 }"
              :disabled="idx === steps.length - 1"
              @click="onRemove(idx)"
              ><X
            /></Button>
          </div>
        </li>
      </ol>
      <FieldError>{{ error }}</FieldError>
    </FieldContent>
  </FieldGroup>
</template>

<script setup lang="ts">
import type { CookingStep } from '@/api/recipes';
import { FieldContent, FieldGroup, FieldTitle, FieldError } from '@/components/ui/field';
import { X } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { watch } from 'vue';
import { useField } from 'vee-validate';

const { value: steps, errorMessage: error } = useField<CookingStep[]>('steps');

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
