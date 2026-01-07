export interface UserLoginResponse {
  access_token: string;
  token_type: string;
}

export interface ErrorResponse {
  detail: string;
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealSlotRecipe {
  id: string;
  name: string;
}

export interface MealSlot {
  id: string;
  meal_type: MealType;
  day_of_week: DayOfWeek;
  recipe: MealSlotRecipe | null;
}

export interface UserWeek {
  id: string;
  name: string;
  user_id: string;
  meal_slots: Array<MealSlot>;
}

export interface UserInfo {
  user_id: string;
  email: string;
  is_active: boolean;
}
