import { useContext } from "react";
import { RecipeCatalogContext } from "./recipeCatalogContext";
import type { RecipeCatalogContextValue } from "../types";

export const useRecipeCatalog = (): RecipeCatalogContextValue => {
  const context = useContext(RecipeCatalogContext);

  if (!context) {
    throw new Error("useRecipeCatalog must be used within RecipeCatalogProvider");
  }

  return context;
};
