import { useContext } from "react";
import { FavoritesContext } from "./favoritesContext";
import type { FavoritesContextValue } from "../types";

export const useFavorites = (): FavoritesContextValue => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }

  return context;
};
