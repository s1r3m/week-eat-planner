<template>
  <FieldGroup>
    <FieldTitle class="font-semibold text-lg text-primary"> Ingredients: </FieldTitle>
    <FieldContent class="flex flex-col">
      <ul class="list-disc marker:text-primary marker:text-xl">
        <li v-for="(ingredient, idx) in ingredients" :key="idx" class="ml-4 mb-3">
          <div class="flex gap-1">
            <Input v-model="ingredient.name" class="flex-5" type="text" placeholder="Ingredient" />
            <Input
              v-model="ingredient.amount"
              class="flex-1"
              type="number"
              min="0"
              placeholder="qty"
            />
            <Select v-model="ingredient.unit" default-value="g">
              <SelectTrigger class="w-18">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="unit in UNITS" :key="unit" :value="unit">
                    {{ unit }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="ghost" class="text-destructive" @click="ingredients.splice(idx, 1)"
              ><X
            /></Button>
          </div>
        </li>
      </ul>
      <Button variant="outline" @click="ingredients.push({ name: '', amount: 0, unit: 'g' })"
        >Add an ingredient</Button
      >
    </FieldContent>
  </FieldGroup>
</template>

<script setup lang="ts">
import { FieldContent, FieldGroup, FieldTitle } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-vue-next';
import { UNITS, type Ingredient } from '@/domain/recipe/models';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ingredients = defineModel<Ingredient[]>('ingredients', { required: true });
</script>
