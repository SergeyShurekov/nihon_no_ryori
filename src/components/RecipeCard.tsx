import { Link } from "react-router-dom";
import { useFavorites } from "../context/useFavorites";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";
import type { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
  missingIngredients?: string[];
}

const RecipeCard = ({ recipe, missingIngredients = [] }: RecipeCardProps) => {
  const { language } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const t = ui[language];
  const favorite = isFavorite(recipe.id);

  return (
    <article className="recipe-card">
      <button
        type="button"
        className={`favorite-button${favorite ? " is-active" : ""}`}
        aria-label={favorite ? t.removeFavorite : t.addFavorite}
        onClick={() => toggleFavorite(recipe.id)}
      >
        {favorite ? "★" : "☆"}
      </button>
      <Link to={`/recipe/${recipe.id}`} className="recipe-link">
        <img src={recipe.image} alt={recipe.title[language]} className="recipe-image" />
        <div className="recipe-info">
          <div className="recipe-topline">
            <span>{recipe.region[language]}</span>
            <span>{recipe.season[language]}</span>
          </div>
          <h3>{recipe.title[language]}</h3>
          <p>{recipe.description[language]}</p>
          <p className="recipe-meta">
            {recipe.time} {t.minutes} | {recipe.servings} {t.servings}
          </p>
          <div className="recipe-tags">
            {recipe.tags[language].map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          {missingIngredients.length > 0 ? (
            <div className="missing-ingredients">
              <p className="missing-ingredients__label">{t.missingIngredients}</p>
              <div className="missing-ingredients__list">
                {missingIngredients.map((ingredient) => (
                  <span key={ingredient}>{ingredient}</span>
                ))}
              </div>
              <p className="missing-ingredients__hint">{t.shoppingHint}</p>
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
};

export default RecipeCard;
