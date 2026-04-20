import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MealSlotAssignRecipeDialog from '../MealSlotAssignRecipeDialog.vue';
import { useQuery, useMutation } from '@pinia/colada';
import i18n from '@/i18n';
import { ref, nextTick } from 'vue';
import type { MealSlot } from '@/api/weeks';
import type { RecipePreview } from '@/api/recipes';
import RecipeSelectCard from '@/features/recipe/components/RecipeSelectCard.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';

vi.mock('@pinia/colada', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  defineQueryOptions: vi.fn((fn) => fn),
  defineMutation: vi.fn((fn) => fn),
}));

vi.mock('@/api/recipes', () => ({
  getFavoritesQuery: vi.fn(() => ({ key: ['recipes', 'favorites'] })),
  getMyRecipesQuery: vi.fn(() => ({ key: ['recipes', 'mine'] })),
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
    (useQuery as any).mockImplementation((optionsFn: any) => {
      const options = optionsFn();
      // Default mock implementation
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
      Dialog: { name: 'Dialog', template: '<div><slot /></div>' },
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
      Button: {
        template: '<button :disabled="disabled"><slot /></button>',
        props: ['disabled'],
      },
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

  it('sets enabled to false when mealSlot is null', () => {
    mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: null,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    const calls = (useQuery as any).mock.calls;
    // Each call's first argument is a function that returns the options
    const favoritesOptions = calls[0][0]();
    const myRecipesOptions = calls[1][0]();

    expect(favoritesOptions.enabled).toBe(false);
    expect(myRecipesOptions.enabled).toBe(false);
  });

  it('sets enabled to true when mealSlot is provided', () => {
    mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    const calls = (useQuery as any).mock.calls;
    const favoritesOptions = calls[0][0]();
    const myRecipesOptions = calls[1][0]();

    expect(favoritesOptions.enabled).toBe(true);
    expect(myRecipesOptions.enabled).toBe(true);
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

  it('renders recipes from both favorites and my-recipes', async () => {
    const favoriteRecipe: RecipePreview = { ...mockRecipe, id: 'fav-1', name: 'Favorite Recipe' };
    const myRecipe: RecipePreview = { ...mockRecipe, id: 'my-1', name: 'My Recipe' };

    (useQuery as any).mockImplementation((optionsFn: any) => {
      const options = optionsFn();
      const isFavorites = options.key?.includes('favorites');
      return {
        data: ref(isFavorites ? [favoriteRecipe] : [myRecipe]),
        isLoading: ref(false),
      };
    });

    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    await nextTick();
    const cards = wrapper.findAllComponents(RecipeSelectCard);
    // Since stubs render both TabsContent simultaneously
    expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(wrapper.text()).toContain('Favorite Recipe');
    expect(wrapper.text()).toContain('My Recipe');

    // Click the second card (My Recipe) to cover the @select on the second tab
    await cards[1].trigger('click');
    // Since selectedRecipe is internal, we check isSelected prop on the card
    expect(cards[1].props('isSelected')).toBe(true);
  });

  it('renders loading state when recipes are loading', async () => {
    (useQuery as any).mockImplementation(() => ({
      data: ref(null),
      isLoading: ref(true),
    }));

    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    expect(wrapper.findAllComponents(TheLoadingPageState).length).toBeGreaterThanOrEqual(1);
  });

  it('renders error state and handles retry for favorites', async () => {
    const mockRefetch = vi.fn();
    (useQuery as any).mockImplementation((optionsFn: any) => {
      const options = optionsFn();
      const isFavorites = options.key?.includes('favorites');
      return {
        data: ref(null),
        isLoading: ref(false),
        error: ref(isFavorites ? new Error('Fav error') : null),
        refetch: mockRefetch,
      };
    });

    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        weekId: weekId,
      } as any,
      global: {
        ...globalMountOptions,
        stubs: {
          ...globalMountOptions.stubs,
          ErrorRetryCard: {
            template: '<div class="error-retry" @click="retry">Retry</div>',
            props: ['error', 'retry'],
          },
        },
      },
    });

    await nextTick();
    const retryBtn = wrapper.find('.error-retry');
    expect(retryBtn.exists()).toBe(true);
    await retryBtn.trigger('click');
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders error state for my-recipes', async () => {
    (useQuery as any).mockImplementation((optionsFn: any) => {
      const options = optionsFn();
      const isMyRecipes = options.key?.includes('mine');
      return {
        data: ref(null),
        isLoading: ref(false),
        error: ref(isMyRecipes ? new Error('MyRecipes error') : null),
      };
    });

    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        weekId: weekId,
      } as any,
      global: {
        ...globalMountOptions,
        stubs: {
          ...globalMountOptions.stubs,
          ErrorRetryCard: {
            name: 'ErrorRetryCard',
            template: '<div class="error-retry">Retry</div>',
            props: ['error', 'retry'],
          },
        },
      },
    });

    await nextTick();
    const errorCard = wrapper.findComponent({ name: 'ErrorRetryCard' });
    expect(errorCard.exists()).toBe(true);
    expect(errorCard.props('error')?.message).toBe('MyRecipes error');
  });

  it('disables assign button if no recipe is selected', async () => {
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    await nextTick();
    const assignBtn = wrapper.findAll('button').find((b) => b.text().includes('Assign'));
    expect(assignBtn?.attributes('disabled')).toBeDefined();
  });

  it('disables assign button if selected recipe is same as current', async () => {
    const mealSlotWithRecipe: MealSlot = { ...mealSlotData, recipe: mockRecipe };
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotWithRecipe,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    await nextTick();
    const assignBtn = wrapper.findAll('button').find((b) => b.text().includes('Assign'));
    expect(assignBtn?.attributes('disabled')).toBeDefined();
  });

  it('handles dialog close by setting mealSlot to null', async () => {
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        'onUpdate:modelValue': (val: any) => wrapper.setProps({ modelValue: val }),
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    // isOpen is a computed based on modelValue
    // We can't directly set isOpen.value because it's internal
    // but the Dialog stub uses v-model:open which emits update:open
    const dialog = wrapper.findComponent({ name: 'Dialog' });
    await dialog.vm.$emit('update:open', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
  });

  it('does nothing when isOpen is set to true (coverage)', async () => {
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    const dialog = wrapper.findComponent({ name: 'Dialog' });
    await dialog.vm.$emit('update:open', true);

    expect(wrapper.emitted()).toEqual({});
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('handles null selectedRecipe in onAssign (coverage)', async () => {
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        weekId: weekId,
      } as any,
      global: globalMountOptions,
    });

    // Button is disabled, but we can still trigger onAssign if we find it
    // Or we can just call it via vm if we didn't use script setup, but we did.
    // So we trigger the click on the button.
    const assignBtn = wrapper
      .findAllComponents({ name: 'Button' })
      .find((b) => b.text().includes('Assign'));
    await assignBtn?.trigger('click');

    expect(mockMutate).not.toHaveBeenCalled();
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
      slots: [{ slot_id: mealSlotData.id, recipe: mockRecipe }],
    });
  });
});
