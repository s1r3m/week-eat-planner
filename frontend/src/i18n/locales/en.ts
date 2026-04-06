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

export default {
  mealTypes,
  daysOfWeek,
  mealSlotCard,
};
