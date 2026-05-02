import { createContext } from "react";
import type { RecipeCatalogContextValue } from "../types";

export const RecipeCatalogContext = createContext<RecipeCatalogContextValue | null>(null);
