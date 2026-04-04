import React from "react";
import { Link, useParams } from "react-router-dom";
import { recipes } from "../data/recipes";
import RecipeDetailHeader from "../components/RecipeDetailHeader";
import RecipeDetailIngredients from "../components/RecipeDetailIngredients";
import RecipeDetailInstructions from "../components/RecipeDetailInstructions";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const RecipeDetailPage = () => {
  const { language } = useLanguage();
  const t = ui[language];
  const { id } = useParams();
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-empty">
          <h2>{t.recipeNotFoundTitle}</h2>
          <p>{t.recipeNotFoundBody}</p>
          <Link to="/" className="back-link">
            {t.backToList}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      <RecipeDetailHeader recipe={recipe} />
      <main className="recipe-detail-content">
        <RecipeDetailIngredients recipe={recipe} />
        <RecipeDetailInstructions recipe={recipe} />
      </main>
      <section className="detail-notes">
        <article className="note-card">
          <p className="eyebrow">{t.kitchenNotes}</p>
          <h2>{t.kitchenNotesTitle}</h2>
          <p>{t.kitchenNotesBody({ difficulty: recipe.difficulty[language], price: recipe.originalPrice })}</p>
        </article>
        <article className="note-card">
          <p className="eyebrow">{t.servingStyle}</p>
          <h2>{t.servingStyleTitle}</h2>
          <p>
            {recipe.category === "main"
              ? t.servingStyleMain
              : t.servingStyleOther}
          </p>
        </article>
      </section>
    </div>
  );
};

export default RecipeDetailPage;
