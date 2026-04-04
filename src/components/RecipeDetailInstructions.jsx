import React from "react";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const RecipeDetailInstructions = ({ recipe }) => {
  const { language } = useLanguage();
  const t = ui[language];

  return (
    <section className="recipe-detail-section instructions-section">
      <h2>{t.instructions}</h2>
      <ol>
        {recipe.instructions[language].map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </section>
  );
};

export default RecipeDetailInstructions;
