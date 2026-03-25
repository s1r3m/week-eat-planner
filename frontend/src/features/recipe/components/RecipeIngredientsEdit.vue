<template>
  <Card>
    <CardTitle class="mx-6 font-semibold text-primary"> Ingredients: </CardTitle>
    <CardContent class="flex flex-col">
      <ul class="list-disc marker:text-primary marker:text-xl">
        <li v-for="(ingredient, idx) in ingredients" :key="ingredient.name" class="ml-4 mb-3">
          <div class="flex gap-1">
            <Input v-model="ingredient.name" class="flex-5" type="text" placeholder="Ingredient" />
            <Input
              v-model="ingredient.amount"
              class="flex-1"
              type="number"
              min="0"
              placeholder="#"
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
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
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

const ingredients = ref<Ingredient[]>([{ name: '', amount: 0, unit: 'g' }]);
</script>
