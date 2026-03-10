import type { DayOfWeek, MealType } from '@/domain/week/models';

const mealTypes = {
  BREAKFAST: 'Завтрак',
  LUNCH: 'Обед',
  DINNER: 'Ужин',
  SNACK: 'Перекус',
} satisfies Record<MealType, string>;

const daysOfWeek = {
  MONDAY: 'Понедельник',
  TUESDAY: 'Вторник',
  WEDNESDAY: 'Среда',
  THURSDAY: 'Четверг',
  FRIDAY: 'Пятница',
  SATURDAY: 'Суббота',
  SUNDAY: 'Воскресенье',
} satisfies Record<DayOfWeek, string>;

const mealSlotCard = {
  assignRecipe: 'Назначить рецепт',
};

export default {
  mealTypes,
  daysOfWeek,
  mealSlotCard,
};
