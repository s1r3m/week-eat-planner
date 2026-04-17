<template>
  <Dialog v-if="mealSlot" v-model:open="isOpen">
    <DialogContent class="sm:max-w-4xl flex flex-col h-[80vh]">
      <DialogHeader>
        <DialogTitle
          >{{ t('assignRecipeDialog.title', { meal_type: t(`mealTypes.${mealSlot.meal_type}`) }) }}
          <!-- { t(`mealTypes.${mealSlot.meal_type}`) }} -->
        </DialogTitle>
        <DialogDescription>{{ t('assignRecipeDialog.description') }}</DialogDescription>
      </DialogHeader>

      <Tabs default-value="favorites" class="flex-1 flex flex-col min-h-0">
        <TabsList>
          <TabsTrigger value="favorites">{{ t('assignRecipeDialog.favorites') }} </TabsTrigger>
          <TabsTrigger value="my-recipes">{{ t('assignRecipeDialog.my_recipes') }} </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" class="flex-1 overflow-y-auto mt-4 pr-2">
          <div v-if="favorites" class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
            <RecipeSelectCard
              v-for="recipe in favorites"
              :key="recipe.id"
              :recipe="recipe"
              :is-selected="selectedRecipe?.id === recipe.id"
              @select="selectedRecipe = recipe"
            />
          </div>
          <TheLoadingPageState v-else loading-name="recipes" />
        </TabsContent>

        <TabsContent value="my-recipes" class="flex-1 overflow-y-auto mt-4 pr-2">
          <div v-if="myRecipes" class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
            <RecipeSelectCard
              v-for="recipe in myRecipes"
              :key="recipe.id"
              :recipe="recipe"
              :is-selected="selectedRecipe?.id === recipe.id"
              @select="selectedRecipe = recipe"
            />
          </div>
          <TheLoadingPageState v-else loading-name="recipes" />
        </TabsContent>
      </Tabs>

      <DialogFooter class="mt-4">
        <DialogClose as-child>
          <Button variant="outline"> {{ t('assignRecipeDialog.cancel') }} </Button>
        </DialogClose>
        <Button :disabled="disabled" @click="onAssign">{{ t('assignRecipeDialog.assign') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
import { assignRecipeMutation } from '@/api/mealSlots';
import RecipeSelectCard from '@/features/recipe/components/RecipeSelectCard.vue';

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

watch(
  () => mealSlot.value,
  (newVal) => {
    if (newVal) {
      selectedRecipe.value = newVal.recipe;
    } else {
      selectedRecipe.value = null;
    }
  },
  { immediate: true },
);

const disabled = computed(
  () => !(selectedRecipe.value && mealSlot.value?.recipe?.id !== selectedRecipe.value.id),
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
