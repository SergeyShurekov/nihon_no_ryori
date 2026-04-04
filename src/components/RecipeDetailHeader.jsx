import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const RecipeDetailHeader = ({ recipe }) => {
  const { language } = useLanguage();
  const t = ui[language];

  return (
    <header className="recipe-detail-header">
      <img
        src={recipe.image}
        alt={recipe.title[language]}
        className="recipe-hero-image"
      />
      <div className="header-copy">
        <Link to="/" className="back-link">
          {t.backToList}
        </Link>
        <p className="eyebrow">{t.recipeDetail}</p>
        <h1>{recipe.title[language]}</h1>
        <p>{recipe.description[language]}</p>
        <div className="meta-tags">
          <span>{recipe.time} {t.minutes}</span>
          <span>{recipe.servings} {t.servings}</span>
          <span>{recipe.originalPrice} {t.approxPrice}</span>
          <span>{recipe.region[language]}</span>
          <span>{recipe.difficulty[language]}</span>
        </div>
        <div className="recipe-tags">
          {recipe.tags[language].map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </header>
  );
};

export default RecipeDetailHeader;
