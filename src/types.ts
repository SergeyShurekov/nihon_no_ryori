import type { Dispatch, ReactNode, SetStateAction } from "react";

export type Language = "ja" | "ru";
export type LocalizedText = Record<Language, string>;
export type LocalizedList = Record<Language, string[]>;

export interface Category {
  id: "main" | "side" | "dessert" | "soup";
  name: LocalizedText;
}

export interface Recipe {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  category: Category["id"];
  image: string;
  time: number;
  servings: number;
  originalPrice: number;
  difficulty: LocalizedText;
  region: LocalizedText;
  season: LocalizedText;
  tags: LocalizedList;
  pantryTerms: LocalizedList;
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

export interface ProviderProps {
  children: ReactNode;
}
