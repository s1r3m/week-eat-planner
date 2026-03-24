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
                    <Select default-value="g">
                      <SelectTrigger class="w-18">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem
                            v-for="unit in UNITS"
                            :key="unit"
                            v-model="ingredient.unit"
                            :value="unit"
                          >
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
                @click="ingredients.push({ name: '', amount: '', unit: 'g' })"
                >Add a step</Button
              >
            </FieldContent>
          </FieldGroup>

          <FieldSeparator class="my-3" />

          <FieldGroup>
            <FieldTitle class="text-lg"><h2>Cooking steps</h2> </FieldTitle>
            <FieldContent>
              <ol class="list-decimal">
                <li v-for="(step, index) in steps" :key="index" class="mb-3 ml-6 -mr-3">
                  <div class="flex">
                    <Input id="recipeSteps" v-model="step.action" type="text" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      @click="steps.splice(index, 1)"
                      ><X class="text-destructive"
                    /></Button>
                  </div>
                </li>
              </ol>
              <Button variant="outline" type="button" @click="steps.push({ action: '' })"
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
const steps = ref<CookingStep[]>([{ action: '' }]);
const ingredients = ref<Ingredient[]>([{ name: '', amount: '', unit: 'g' }]);

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
</script>
