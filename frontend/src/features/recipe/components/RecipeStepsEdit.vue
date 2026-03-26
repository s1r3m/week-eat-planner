<template>
  <FieldGroup>
    <FieldTitle class="font-semibold text-lg text-primary"> Cooking Steps: </FieldTitle>
    <FieldContent class="flex flex-col">
      <ol class="list-decimal marker:text-primary marker:font-bold">
        <li v-for="(step, idx) in steps" :key="step.order" class="ml-4 mb-3">
          <div class="flex gap-1">
            <Input v-model="step.step" placeholder="Do the..." />
            <Button variant="ghost" class="text-destructive" @click="onRemove(idx)"><X /></Button>
          </div>
        </li>
      </ol>
      <Button variant="outline" @click="steps.push({ order: 0, step: '' })">Add a step</Button>
    </FieldContent>
  </FieldGroup>
</template>

<script setup lang="ts">
import type { CookingStep } from '@/domain/recipe/models';
import { FieldContent, FieldGroup, FieldTitle } from '@/components/ui/field';
import { X } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const steps = defineModel<CookingStep[]>('steps', { required: true });

const onRemove = (index: number) => {
  steps.value.splice(index, 1);
  steps.value.forEach((step, idx) => (step.order = idx));
};
</script>
