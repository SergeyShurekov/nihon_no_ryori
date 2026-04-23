import { useEffect, useMemo, useState } from "react";
import { FavoritesContext } from "./favoritesContext";
import type { ProviderProps } from "../types";

const STORAGE_KEY = "nihon-no-ryori-favorites";

const FavoritesProvider = ({ children }: ProviderProps) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const savedFavorites = window.localStorage.getItem(STORAGE_KEY);

    if (!savedFavorites) {
      return [];
    }

    try {
      const parsedFavorites = JSON.parse(savedFavorites) as unknown;
      return Array.isArray(parsedFavorites)
        ? parsedFavorites.filter((value): value is string => typeof value === "string")
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const value = useMemo(
    () => ({
      favorites,
      isFavorite: (recipeId: string) => favorites.includes(recipeId),
      toggleFavorite: (recipeId: string) => {
        setFavorites((currentFavorites) =>
          currentFavorites.includes(recipeId)
            ? currentFavorites.filter((id) => id !== recipeId)
            : [...currentFavorites, recipeId],
        );
      },
    }),
    [favorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export default FavoritesProvider;
