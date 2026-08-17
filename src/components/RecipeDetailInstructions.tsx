import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";
import type { Recipe } from "../types";

interface RecipeDetailInstructionsProps {
  recipe: Recipe;
}

const RecipeDetailInstructions = ({ recipe }: RecipeDetailInstructionsProps) => {
  const { language } = useLanguage();
  const t = ui[language];
  const sections =
    recipe.instructionSections.length > 0
      ? recipe.instructionSections
      : [
          {
            title: { ja: t.instructions, ru: t.instructions },
            steps: recipe.instructions,
            tips: { ja: [], ru: [] },
          },
        ];

  return (
    <section className="recipe-detail-section instructions-section">
      <h2>{t.instructions}</h2>
      {sections.map((section) => (
        <article className="instruction-section" key={section.title[language]}>
          <h3>{section.title[language]}</h3>
          <ol>
            {section.steps[language].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {section.tips[language].length > 0 ? (
            <ul className="instruction-tips">
              {section.tips[language].map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </section>
  );
};

export default RecipeDetailInstructions;
