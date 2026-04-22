import React from "react";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const formatScaledNumber = (value) => {
  const roundedValue = Math.round(value * 100) / 100;
  return Number.isInteger(roundedValue)
    ? String(roundedValue)
    : String(roundedValue).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
};

const scaleIngredientLine = (line, scaleFactor) => {
  if (line.includes("適量") || line.includes("по вкусу")) {
    return line;
  }

  return line.replace(/\d+(?:[.,]\d+)?(?:\/\d+)?/g, (match) => {
    if (match.includes("/")) {
      const [numerator, denominator] = match.split("/").map(Number);
      if (!denominator) {
        return match;
      }

      return formatScaledNumber((numerator / denominator) * scaleFactor);
    }

    return formatScaledNumber(Number(match.replace(",", ".")) * scaleFactor);
  });
};

const RecipeDetailIngredients = ({ recipe, currentServings, setCurrentServings }) => {
  const { language } = useLanguage();
  const t = ui[language];
  const scaleFactor = currentServings / recipe.servings;

  return (
    <section className="recipe-detail-section ingredients-section">
      <div className="ingredients-header">
        <div>
          <h2>{t.ingredients}</h2>
        </div>
        <div className="servings-control">
          <span className="servings-control__label">{t.servingControl}</span>
          <div className="servings-control__buttons">
            <button
              type="button"
              className="servings-button"
              aria-label={t.decreaseServings}
              onClick={() => setCurrentServings((value) => Math.max(1, value - 1))}
            >
              -
            </button>
            <strong>{currentServings}</strong>
            <button
              type="button"
              className="servings-button"
              aria-label={t.increaseServings}
              onClick={() => setCurrentServings((value) => value + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <ul>
        {recipe.ingredients[language].map((item, index) => (
          <li key={index}>{scaleIngredientLine(item, scaleFactor)}</li>
        ))}
      </ul>
    </section>
  );
};

export default RecipeDetailIngredients;
