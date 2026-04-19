<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <template v-if="recipe">
        <DialogHeader>
          <DialogTitle> Delete {{ recipe.name }}? </DialogTitle>
          <DialogDescription> This action cannot be undone. </DialogDescription>
        </DialogHeader>

        <p class="text-base text-popover-foreground">
          Are you sure you want to delete
          <span class="font-semibold text-destructive">{{ recipe.name }}</span
          >?
        </p>
      </template>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline"> No </Button>
        </DialogClose>
        <Button variant="destructive" :disabled="isLoading || !recipe" @click="onDelete">
          <Spinner v-if="isLoading" />
          {{ isLoading ? 'Deleting...' : 'Yes' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useMutation } from '@pinia/colada';
import { deleteRecipeMutation } from '@/api/recipes';
import type { RecipePreview } from '@/api/recipes';

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

const recipe = defineModel<RecipePreview | null>();
const isOpen = computed({
  get: () => !!recipe.value,
  set: (value) => {
    if (!value) recipe.value = null;
  },
});

const { mutate: remove, isLoading } = useMutation(deleteRecipeMutation());

const router = useRouter();
const onDelete = () => {
  if (!recipe.value) return;
  remove(recipe.value.id);
  recipe.value = null;
  router.push({ name: ROUTE_NAMES.RECIPES_MY });
};
</script>
