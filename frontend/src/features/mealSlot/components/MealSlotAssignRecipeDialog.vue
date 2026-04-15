<template>
  <Dialog v-if="mealSlot" v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Assign a recipe to {{ t(`mealTypes.${mealSlot.meal_type}`) }} </DialogTitle>
        <DialogDescription>Choose a recipe from the list below</DialogDescription>
      </DialogHeader>

      <div class="flex gap-3">
        <Tabs default-value="favorites">
          <TabsList>
            <TabsTrigger value="favorites"> Favorites </TabsTrigger>
            <TabsTrigger value="my-recipes"> My Recipes </TabsTrigger>
            <TabsContent value="favorites">
              <div>
                <!-- <RecipesGrid v-if="favorites" :recipes="favorites" /> -->
                <div v-if="favorites">
                  <div v-for="recipe in favorites" :key="recipe.id">
                    <RecipePreviewCard :recipe="recipe" @click.stop="selectedRecipe = recipe" />
                  </div>
                </div>
                <TheLoadingPageState v-else loading-name="recipes" />
              </div>
            </TabsContent>
            <TabsContent value="my-recipes">
              <div>
                <RecipesGrid v-if="myRecipes" :recipes="myRecipes" />
                <TheLoadingPageState v-else loading-name="recipes" />
              </div>
            </TabsContent>
          </TabsList>
        </Tabs>
      </div>

      <DialogFooter>
        <Button :disabled="disabled" @click="onAssign">Assign</Button>
        <DialogClose as-child>
          <Button variant="outline"> Cancel </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { MealSlot } from '@/api/weeks';
import { getFavoritesQuery, getMyRecipesQuery, type RecipePreview } from '@/api/recipes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery } from '@pinia/colada';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import RecipesGrid from '@/features/recipe/components/RecipesGrid.vue';
import { assignRecipeMutation } from '@/api/mealSlots';
import RecipePreviewCard from '@/features/recipe/components/RecipePreviewCard.vue';

const props = defineProps<{
  weekId: string;
}>();

const mealSlot = defineModel<MealSlot | null>();
const isOpen = computed({
  get: () => !!mealSlot.value,
  set: (value) => {
    if (!value) mealSlot.value = null;
  },
});
const selectedRecipe = ref<RecipePreview | null>(null);
const disabled = computed(
  () => !(selectedRecipe.value && mealSlot.value?.recipe !== selectedRecipe.value),
);
const { data: favorites } = useQuery(getFavoritesQuery());
const { data: myRecipes } = useQuery(getMyRecipesQuery());
const { mutate: assign } = useMutation(assignRecipeMutation());

const onAssign = () => {
  if (!selectedRecipe.value || !mealSlot.value) return;
  assign({
    weekId: props.weekId,
    slots: [{ slot_id: mealSlot.value.id, recipe_id: selectedRecipe.value.id }],
  });
  isOpen.value = false;
};
const { t } = useI18n();
</script>
