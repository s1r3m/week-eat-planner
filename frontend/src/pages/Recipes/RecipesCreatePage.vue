<template>
  <div id="createRecipePage" class="space-y-9 mb-9">
    <PageTitle header="Create a recipe" description="Fill the fields to create a recipe" />

    <Card class="mx-6 flex space-y-3">
      <div class="mx-6">
        <form id="recipeForm" @submit.prevent="onCreate">
          <FieldGroup>
            <FieldLabel for="recipeName"> Name </FieldLabel>
            <Input id="recipeName" v-model="name" type="text" />

            <FieldLabel for="recipeSteps"> How to cook </FieldLabel>
            <Input id="recipeSteps" v-model="steps" type="text" />

            <FieldLabel for="ingredients"> Ingredients </FieldLabel>
            <div class="grid-cols-2 space-y-3">
              <div class="flex gap-3">
                <Input id="ingredients" v-model="ingredients" type="text" class="flex-3" />
                <Input id="ingredients" v-model="ingredients" type="text" class="flex-1" />
              </div>
            </div>
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
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';
import { useRecipeStore } from '@/features/recipe';
import { useRouter } from 'vue-router';
import { Card } from '@/components/ui/card';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const name = ref('');
const steps = ref('');
const ingredients = ref('');

const recipeStore = useRecipeStore();
const { call: create, isLoading } = useAsyncCall(recipeStore.createRecipe);

const router = useRouter();

const onCancel = () => {
  router.push({ name: ROUTE_NAMES.RECIPES_MY });
};

const onCreate = async () => {
  console.log('create recipe', name, steps, ingredients);
  await create(name.value, steps.value, ingredients.value); // Form passig here
  name.value = ''; // Form reset here
  steps.value = '';
  ingredients.value = '';
  router.push({ name: ROUTE_NAMES.RECIPES_MY });
};
</script>
