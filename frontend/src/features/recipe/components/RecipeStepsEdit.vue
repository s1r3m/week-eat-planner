<template>
  <Card>
    <CardTitle class="mx-6 font-semibold text-primary"> Cooking Steps: </CardTitle>
    <CardContent class="flex flex-col">
      <ol class="list-decimal marker:text-primary marker:font-bold">
        <li v-for="(step, idx) in steps" :key="step.order" class="ml-4 mb-3">
          <div class="flex gap-1">
            <Input v-model="step.step" placeholder="Do the..." />
            <Button variant="ghost" class="text-destructive" @click="onRemove(idx)"><X /></Button>
          </div>
        </li>
      </ol>
      <Button variant="outline" @click="steps.push({ order: 0, step: '' })"
        >Add an ingredient</Button
      >
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import type { CookingStep } from '@/domain/recipe/models';
import { X } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const steps = ref<CookingStep[]>([{ order: 0, step: '' }]);

const onRemove = (index: number) => {
  steps.value.splice(index, 1);
  steps.value.forEach((step, idx) => (step.order = idx));
};
</script>
