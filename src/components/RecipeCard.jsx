import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const RecipeCard = ({ recipe }) => {
  const { language } = useLanguage();
  const t = ui[language];

  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-link">
      <article className="recipe-card">
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
        </div>
      </article>
    </Link>
  );
};

export default RecipeCard;
