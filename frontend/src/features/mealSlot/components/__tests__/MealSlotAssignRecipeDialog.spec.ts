import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MealSlotAssignRecipeDialog from '../MealSlotAssignRecipeDialog.vue';
import { useQuery, useMutation } from '@pinia/colada';
import i18n from '@/i18n';
import { ref, nextTick } from 'vue';
import type { MealSlot } from '@/api/weeks';
import type { RecipePreview } from '@/api/recipes';
import RecipeSelectCard from '@/features/recipe/components/RecipeSelectCard.vue';

vi.mock('@pinia/colada', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  defineQueryOptions: vi.fn((fn) => fn),
  defineMutation: vi.fn((fn) => fn),
}));

vi.mock('@/api/recipes', () => ({
  getFavoritesQuery: vi.fn(),
  getMyRecipesQuery: vi.fn(),
}));

vi.mock('@/api/mealSlots', () => ({
  assignRecipeMutation: vi.fn(),
}));

describe('MealSlotAssignRecipeDialog', () => {
  const mockMutate = vi.fn();
  const weekId = 'week-1';
  const mockRecipe: RecipePreview = {
    id: 'recipe-1',
    name: 'Favorite Recipe',
    author: 'Author',
    is_favorite: true,
    image_url: null,
  };
  const mealSlotData: MealSlot = {
    id: 'slot-1',
    meal_type: 'LUNCH',
    day_of_week: 'MONDAY',
    recipe: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as any).mockImplementation((query: any) => {
      // Mocking different data for different queries if needed
      return {
        data: ref([mockRecipe]),
        isLoading: ref(false),
      };
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
    });
  });

  const globalMountOptions = {
    plugins: [i18n],
    stubs: {
      Dialog: { template: '<div><slot /></div>' },
      DialogContent: { template: '<div><slot /></div>' },
      DialogHeader: { template: '<div><slot /></div>' },
      DialogTitle: { template: '<div><slot /></div>' },
      DialogDescription: { template: '<div><slot /></div>' },
      DialogFooter: { template: '<div><slot /></div>' },
      DialogClose: { template: '<div><slot /></div>' },
      Tabs: { template: '<div><slot /></div>' },
      TabsList: { template: '<div><slot /></div>' },
      TabsTrigger: { template: '<div><slot /></div>' },
      TabsContent: { template: '<div><slot /></div>' },
      RecipeSelectCard: {
        template:
          '<div class="recipe-card" @click="$emit(\'select\', recipe)">{{ recipe.name }}</div>',
        props: ['recipe', 'isSelected'],
      },
    },
  };

  it('renders the dialog when mealSlot is provided', () => {
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        'onUpdate:modelValue': (val: any) => wrapper.setProps({ modelValue: val }),
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    expect(wrapper.text()).toContain('Assign a recipe to');
  });

  it('initializes selectedRecipe from mealSlot.recipe', async () => {
    const mealSlotWithRecipe: MealSlot = { ...mealSlotData, recipe: mockRecipe };
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotWithRecipe,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    // We can't easily check internal ref 'selectedRecipe',
    // but we can check if the correct card has isSelected=true
    await nextTick();
    const cards = wrapper.findAllComponents(RecipeSelectCard);
    const selectedCard = cards.find((c) => c.props('isSelected') === true);
    expect(selectedCard).toBeDefined();
    expect(selectedCard?.props('recipe').id).toBe(mockRecipe.id);
  });

  it('updates selectedRecipe when a card is clicked', async () => {
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    await nextTick();
    const card = wrapper.findComponent(RecipeSelectCard);
    await card.trigger('click');

    expect(card.props('isSelected')).toBe(true);
  });

  it('calls assign mutation with correct data on assign click', async () => {
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    await nextTick();
    // Select recipe
    const card = wrapper.findComponent(RecipeSelectCard);
    await card.trigger('click');

    // Find and click assign button
    const assignBtn = wrapper.findAll('button').find((b) => b.text().includes('Assign'));
    await assignBtn?.trigger('click');

    expect(mockMutate).toHaveBeenCalledWith({
      weekId: weekId,
      slots: [{ slot_id: mealSlotData.id, recipe_id: mockRecipe.id }],
    });
  });
});
