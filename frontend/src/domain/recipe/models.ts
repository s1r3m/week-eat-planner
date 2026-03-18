export interface RecipeMinimal {
  id: string;
  name: string;
  author?: string;
  isFavorite?: boolean;
  isOfficial?: boolean;
  cover_url?: string;
}
