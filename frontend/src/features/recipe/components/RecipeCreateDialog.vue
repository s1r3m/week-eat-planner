<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> Create a recipe </DialogTitle>
        <DialogDescription>
          Add as much info as possible to make your life easier
        </DialogDescription>
      </DialogHeader>

      <form id="weekForm" @submit.prevent="onCreate">
        <FieldGroup>
          <FieldLabel for="recipeName"> Name </FieldLabel>
          <Input id="recipeName" v-model="name" type="text" />
        </FieldGroup>
      </form>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline"> Cancel </Button>
        </DialogClose>
        <Button form="weekForm" type="submit" :disabled="!name.trim() || isLoading">
          <Spinner v-if="isLoading" />
          {{ isLoading ? 'Creating...' : 'Create recipe' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';
import { useRecipeStore } from '../store/recipes';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const isOpen = defineModel<boolean>();
const name = ref('');

const recipeStore = useRecipeStore();
const { call: create, isLoading } = useAsyncCall(recipeStore.createRecipe);

const onCreate = async () => {
  await create(name.value); // Form passig here
  isOpen.value = false;
  name.value = ''; // Form reset here
};
</script>
