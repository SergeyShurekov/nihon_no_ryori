import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import { useRecipeCatalog } from "../context/useRecipeCatalog";
import { ui } from "../i18n/translations";

const DESCRIPTION_LIMIT = 160;

const trimDescription = (value: string): string =>
  value.length > DESCRIPTION_LIMIT
    ? `${value.slice(0, DESCRIPTION_LIMIT - 1).trim()}…`
    : value;

const SeoManager = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const { recipes } = useRecipeCatalog();
  const t = ui[language];

  useEffect(() => {
    const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const recipeMatch = location.pathname.match(/^\/recipe\/([^/]+)$/);

    let nextTitle = t.seoHomeTitle;
    let nextDescription = t.seoHomeDescription;

    if (recipeMatch) {
      const recipeId = recipeMatch[1];
      const recipe = recipes.find((item) => item.id === recipeId);

      if (recipe) {
        nextTitle = t.seoRecipeTitle(recipe.title[language]);
        nextDescription = t.seoRecipeDescription(
          recipe.title[language],
          recipe.description[language],
        );
      }
    }

    if (location.pathname === "/admin") {
      nextTitle = t.seoAdminTitle;
      nextDescription = t.seoAdminDescription;
    }

    document.title = nextTitle;

    if (descriptionTag) {
      descriptionTag.setAttribute("content", trimDescription(nextDescription));
    }
  }, [language, location.pathname, recipes, t]);

  return null;
};

export default SeoManager;
