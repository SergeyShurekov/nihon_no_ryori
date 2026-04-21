import React, { useEffect, useMemo, useState } from "react";
import { FavoritesContext } from "./favoritesContext";

const STORAGE_KEY = "nihon-no-ryori-favorites";

const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const savedFavorites = window.localStorage.getItem(STORAGE_KEY);

    if (!savedFavorites) {
      return [];
    }

    try {
      const parsedFavorites = JSON.parse(savedFavorites);
      return Array.isArray(parsedFavorites) ? parsedFavorites : [];
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
      isFavorite: (recipeId) => favorites.includes(recipeId),
      toggleFavorite: (recipeId) => {
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
