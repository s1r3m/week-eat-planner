import type { DayOfWeek, MealType } from '@/api/weeks';

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
  assignRecipe: 'Добавить блюдо',
};

const navigation = {
  menu: 'Меню',
  mobileDescription: 'Мобильное меню навигации',
};

export default {
  mealTypes,
  daysOfWeek,
  mealSlotCard,
  navigation,
};
