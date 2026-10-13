import type { IRecipeForm } from '@/modules/recipes/types'

export const createEmptyForm = (): IRecipeForm => ({
  ingredients: [],
  name: '',
  portions: 2,
  steps: [],
})
