import * as zod from 'zod';
import { UNITS, type Ingredient, type CookingStep } from '@/api/recipes';

export const recipeInfoSchema = zod.object({
  name: zod.string().trim().min(1, { error: 'Recipe must have a name' }),
  image: zod.instanceof(File).nullable().optional(),
});

export const ingredientSchema: zod.ZodType<Ingredient> = zod.object({
  name: zod.string(),
  amount: zod.coerce.number().min(0),
  unit: zod.enum(UNITS),
});

export const ingredientsSchema = zod
  .array(ingredientSchema)
  .min(2, { error: 'At least one ingredient must be present' })
  .refine((items) => items.slice(0, -1).every((i) => i.name.trim().length > 0), {
    error: 'All added ingredients must have a name',
  });

export const stepSchema: zod.ZodType<CookingStep> = zod.object({
  step: zod.string().trim(),
  order: zod.number(),
});

export const stepsSchema = zod
  .array(stepSchema)
  .min(2, { error: 'At least one step must be present' })
  .refine((items) => items.slice(0, -1).every((s) => s.step.trim().length > 0), {
    error: 'All added steps must not be empty',
  });

export const recipeFormSchema = zod.object({
  ...recipeInfoSchema.shape,
  ingredients: ingredientsSchema,
  steps: stepsSchema,
});

export type RecipeFormValues = zod.infer<typeof recipeFormSchema>;
