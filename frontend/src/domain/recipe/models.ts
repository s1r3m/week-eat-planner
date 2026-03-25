export const UNITS = ['g', 'ml', 'pcs', 'cans'] as const;
type Unit = (typeof UNITS)[number];

export interface RecipeMinimal {
  id: string;
  name: string;
  author?: string;
  isFavorite?: boolean;
  isOfficial?: boolean;
  cover_url?: string;
}

export interface CookingStep {
  order: number;
  step: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: Unit;
}

export interface RecipeFull extends RecipeMinimal {
  steps: CookingStep[];
  ingredients: Ingredient[];
}

export interface RecipePayload {
  name: string;
  steps: CookingStep[];
  ingredients: Ingredient[];
  cover_file?: string;
}
