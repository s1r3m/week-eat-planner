import type { DayOfWeek, MealType } from '@/api/weeks';

const mealTypes = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
} satisfies Record<MealType, string>;

const daysOfWeek = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
} satisfies Record<DayOfWeek, string>;

const mealSlotCard = {
  assignRecipe: 'Assign a recipe',
};

const assignRecipeDialog = {
  title: 'Assign a recipe to {meal_type}',
  description: 'Choose a recipe from the list below',
  favorites: 'Favorites',
  my_recipes: 'My recipes',
  assign: 'Assign',
  cancel: 'Cancel',
};

export default {
  mealTypes,
  daysOfWeek,
  mealSlotCard,
  assignRecipeDialog,
  navigation: {
    menu: 'Menu',
    mobileDescription: 'Mobile navigation menu',
  },
};
