import type { Dispatch, ReactNode, SetStateAction } from "react";

export type Language = "ja" | "ru";
export type LocalizedText = Record<Language, string>;
export type LocalizedList = Record<Language, string[]>;

export interface Category {
  id: "main" | "side" | "dessert" | "soup";
  name: LocalizedText;
}

export interface IngredientGroup {
  key: string;
  name: LocalizedText;
  items: LocalizedList;
}

export interface InstructionSection {
  title: LocalizedText;
  steps: LocalizedList;
  tips: LocalizedList;
}

export interface CommonMistake {
  mistake: LocalizedText;
  consequence: LocalizedText;
  solution: LocalizedText;
}

export interface ServingProfileItem {
  aspect: LocalizedText;
  description: LocalizedText;
}

export interface StorageItem {
  component: LocalizedText;
  storage: LocalizedText;
  reheating: LocalizedText;
}

export interface Recipe {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  category: Category["id"];
  image: string;
  prepTime: number;
  cookTime: number;
  time: number;
  servings: number;
  originalPrice: number;
  difficulty: LocalizedText;
  cuisine: LocalizedText;
  region: LocalizedText;
  season: LocalizedText;
  tags: LocalizedList;
  pantryTerms: LocalizedList;
  ingredientGroups: IngredientGroup[];
  instructionSections: InstructionSection[];
  commonMistakes: CommonMistake[];
  servingProfile: ServingProfileItem[];
  upgrades: LocalizedList;
  storage: StorageItem[];
  adaptations: LocalizedList;
  relatedRecipes: string[];
  ingredients: LocalizedList;
  instructions: LocalizedList;
}

export interface LanguageContextValue {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  isJapanese: boolean;
}

export interface FavoritesContextValue {
  favorites: string[];
  isFavorite: (recipeId: string) => boolean;
  toggleFavorite: (recipeId: string) => void;
}

export interface RecipeCatalogContextValue {
  recipes: Recipe[];
  customRecipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, "id">) => void;
  updateRecipe: (recipeId: string, recipe: Omit<Recipe, "id">) => void;
  deleteRecipe: (recipeId: string) => void;
}

export interface ProviderProps {
  children: ReactNode;
}
