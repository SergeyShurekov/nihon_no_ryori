import { createContext } from "react";
import type { FavoritesContextValue } from "../types";

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);
