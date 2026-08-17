import parsedRecipes from "./recipes.parsed.json";
import type { Recipe } from "../types";

export const RECIPE_PLACEHOLDER_IMAGE = "/recipe-placeholder.svg";

const normalizeRecipe = (recipe: Recipe): Recipe => ({
  ...recipe,
  image: recipe.image?.trim() ? recipe.image : RECIPE_PLACEHOLDER_IMAGE,
  prepTime: recipe.prepTime ?? 0,
  cookTime: recipe.cookTime ?? recipe.time ?? 0,
  ingredientGroups: recipe.ingredientGroups ?? [],
  instructionSections: recipe.instructionSections ?? [],
  commonMistakes: recipe.commonMistakes ?? [],
  servingProfile: recipe.servingProfile ?? [],
  upgrades: recipe.upgrades ?? { ja: [], ru: [] },
  storage: recipe.storage ?? [],
  adaptations: recipe.adaptations ?? { ja: [], ru: [] },
  relatedRecipes: recipe.relatedRecipes ?? [],
  cuisine: recipe.cuisine ?? recipe.region,
});

export const recipes: Recipe[] = (parsedRecipes as Recipe[]).map(normalizeRecipe);
