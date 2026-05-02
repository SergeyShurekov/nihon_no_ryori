import { useEffect, useMemo, useState } from "react";
import { recipes as baseRecipes } from "../data/recipes";
import { RecipeCatalogContext } from "./recipeCatalogContext";
import type { ProviderProps, Recipe } from "../types";

const STORAGE_KEY = "nihon-no-ryori-custom-recipes";

const RecipeCatalogProvider = ({ children }: ProviderProps) => {
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const savedRecipes = window.localStorage.getItem(STORAGE_KEY);

    if (!savedRecipes) {
      return [];
    }

    try {
      const parsedRecipes = JSON.parse(savedRecipes) as unknown;
      return Array.isArray(parsedRecipes) ? (parsedRecipes as Recipe[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customRecipes));
  }, [customRecipes]);

  const value = useMemo(
    () => ({
      recipes: [...baseRecipes, ...customRecipes],
      customRecipes,
      addRecipe: (recipe: Omit<Recipe, "id">) => {
        setCustomRecipes((currentRecipes) => [
          ...currentRecipes,
          {
            ...recipe,
            id: `custom-${Date.now()}`,
          },
        ]);
      },
      updateRecipe: (recipeId: string, recipe: Omit<Recipe, "id">) => {
        setCustomRecipes((currentRecipes) =>
          currentRecipes.map((currentRecipe) =>
            currentRecipe.id === recipeId
              ? {
                  ...recipe,
                  id: recipeId,
                }
              : currentRecipe,
          ),
        );
      },
      deleteRecipe: (recipeId: string) => {
        setCustomRecipes((currentRecipes) =>
          currentRecipes.filter((currentRecipe) => currentRecipe.id !== recipeId),
        );
      },
    }),
    [customRecipes],
  );

  return <RecipeCatalogContext.Provider value={value}>{children}</RecipeCatalogContext.Provider>;
};

export default RecipeCatalogProvider;
