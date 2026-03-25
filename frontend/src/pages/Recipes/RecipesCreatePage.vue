<template>
  <div id="createRecipePage" class="space-y-9 mb-9">
    <PageTitle header="Create a recipe" description="Fill the fields to create a recipe" />

    <Card class="mx-6 flex space-y-3">
      <div class="mx-6">
        <form id="recipeForm" @submit.prevent="onCreate">
          <FieldGroup>
            <FieldTitle class="text-lg"><h2>Recipe info</h2> </FieldTitle>
            <FieldContent>
              <FieldLabel for="recipeName"> Name </FieldLabel>
              <Input
                id="recipeName"
                v-model="name"
                type="text"
                placeholder="e.g. Pasta Carbonara"
              />
              <FieldLabel for="recipeName"> Recipe photo </FieldLabel>
              <Input
                type="file"
                accept="image/*"
                class="file:-ml-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:cursor-pointer"
                @change="onFileChange"
              />
              <div class="h-36 md:h-48 w-full bg-primary/20 rounded-xl overflow-hidden">
                <img
                  :src="img || defaultImg"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </FieldContent>
          </FieldGroup>

          <FieldSeparator class="my-3" />

          <FieldGroup>
            <FieldTitle class="text-lg"><h2>Ingredients</h2> </FieldTitle>
            <FieldContent>
              <ol class="list-decimal">
                <li v-for="(ingredient, index) in ingredients" :key="index" class="mb-3 ml-6 -mr-3">
                  <div class="flex">
                    <Input
                      id="ingredient-name"
                      v-model="ingredient.name"
                      class="flex-5"
                      type="text"
                    />
                    <Input
                      id="ingredient-amount"
                      v-model="ingredient.amount"
                      class="flex-1"
                      type="text"
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      @click="ingredients.splice(index, 1)"
                      ><X class="text-destructive"
                    /></Button>
                  </div>
                </li>
              </ol>
              <Button
                variant="outline"
                type="button"
                @click="ingredients.push({ name: '', amount: 0, unit: 'g' })"
                >Add an ingredient</Button
              >
            </FieldContent>
          </FieldGroup>

          <FieldSeparator class="my-3" />

          <FieldGroup>
            <FieldTitle class="text-lg"><h2>Cooking steps</h2> </FieldTitle>
            <FieldContent>
              <ol class="list-decimal">
                <li v-for="step in steps" :key="step.order" class="mb-3 ml-6 -mr-3">
                  <div class="flex">
                    <Input id="recipeSteps" v-model="step.step" type="text" />
                    <Button type="button" variant="ghost" size="icon" @click="onRemove(step.order)"
                      ><X class="text-destructive"
                    /></Button>
                  </div>
                </li>
              </ol>
              <Button
                variant="outline"
                type="button"
                @click="steps.push({ order: steps.length, step: '' })"
                >Add a step</Button
              >
            </FieldContent>
          </FieldGroup>
        </form>
      </div>

      <div id="controls" class="flex gap-3 justify-end mx-6">
        <Button variant="outline" @click="onCancel"> Cancel </Button>
        <Button form="recipeForm" type="submit" :disabled="!name.trim() || isLoading">
          <Spinner v-if="isLoading" />
          {{ isLoading ? 'Creating...' : 'Create recipe' }}
        </Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAsyncCall } from '@/composables/useAsyncCall';
import { useRecipeStore } from '@/features/recipe';
import { useRouter } from 'vue-router';
import { Card } from '@/components/ui/card';
import {
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldTitle,
} from '@/components/ui/field';
import { X } from 'lucide-vue-next';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import { UNITS, type CookingStep, type Ingredient } from '@/domain/recipe/models';

const name = ref('');
const cover = ref<File | null>(null);
const img = ref('');
const steps = ref<CookingStep[]>([{ order: 0, step: '' }]);
const ingredients = ref<Ingredient[]>([{ name: '', amount: 0, unit: 'g' }]);

const recipeStore = useRecipeStore();
const { call: create, isLoading } = useAsyncCall(recipeStore.createRecipe);

const router = useRouter();

const onCancel = () => {
  router.push({ name: ROUTE_NAMES.RECIPES_MY });
};

const onCreate = async () => {
  await create({ name: name.value, steps: steps.value, ingredients: ingredients.value });
  router.push({ name: ROUTE_NAMES.RECIPES_MY });
};

const onRemove = (index: number) => {
  steps.value.splice(index, 1);
  steps.value.forEach((step, idx) => (step.order = idx));
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files?.length) return;

  cover.value = target.files[0];
  if (img.value) URL.revokeObjectURL(img.value);
  img.value = URL.createObjectURL(cover.value);
};
const defaultImg = new URL('@/assets/recipe_bg.png', import.meta.url).href;
</script>
