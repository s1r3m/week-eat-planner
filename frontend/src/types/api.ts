export interface UserLoginResponse {
  access_token: string;
  token_type: string;
}

export interface MealSlot {
  id: string;
  meal_type: string;
  day_of_week: string;
  recipe_id: string | null;
}

export interface UserWeek {
  id: string;
  name: string;
  user_id: string;
  meal_slots: Array<MealSlot>;
}
