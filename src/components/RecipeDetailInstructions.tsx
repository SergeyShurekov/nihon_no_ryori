import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";
import type { Recipe } from "../types";

interface RecipeDetailInstructionsProps {
  recipe: Recipe;
}

const RecipeDetailInstructions = ({ recipe }: RecipeDetailInstructionsProps) => {
  const { language } = useLanguage();
  const t = ui[language];

  return (
    <section className="recipe-detail-section instructions-section">
      <h2>{t.instructions}</h2>
      <ol>
        {recipe.instructions[language].map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
};

export default RecipeDetailInstructions;
