import React from "react";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const RecipeDetailIngredients = ({ recipe }) => {
  const { language } = useLanguage();
  const t = ui[language];

  return (
    <section className="recipe-detail-section ingredients-section">
      <h2>{t.ingredients}</h2>
      <ul>
        {recipe.ingredients[language].map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
};

export default RecipeDetailIngredients;
