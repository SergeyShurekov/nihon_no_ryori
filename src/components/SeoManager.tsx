import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recipes } from "../data/recipes";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const DESCRIPTION_LIMIT = 160;

const trimDescription = (value: string): string =>
  value.length > DESCRIPTION_LIMIT
    ? `${value.slice(0, DESCRIPTION_LIMIT - 1).trim()}…`
    : value;

const SeoManager = () => {
  const location = useLocation();
  const { language } = useLanguage();
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

    document.title = nextTitle;

    if (descriptionTag) {
      descriptionTag.setAttribute("content", trimDescription(nextDescription));
    }
  }, [language, location.pathname, t]);

  return null;
};

export default SeoManager;
