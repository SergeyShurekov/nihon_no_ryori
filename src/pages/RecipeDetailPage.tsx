import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import RecipeDetailHeader from "../components/RecipeDetailHeader";
import RecipeDetailIngredients from "../components/RecipeDetailIngredients";
import RecipeDetailInstructions from "../components/RecipeDetailInstructions";
import { recipes } from "../data/recipes";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const RecipeDetailPage = () => {
  const { language } = useLanguage();
  const t = ui[language];
  const { id } = useParams();
  const recipe = recipes.find((item) => item.id === id);
  const [servingsByRecipe, setServingsByRecipe] = useState<Record<string, number>>({});

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

  const currentServings = servingsByRecipe[recipe.id] ?? recipe.servings;
  const setCurrentServings = (updater: number | ((value: number) => number)) => {
    setServingsByRecipe((currentState) => {
      const currentValue = currentState[recipe.id] ?? recipe.servings;
      const nextValue = typeof updater === "function" ? updater(currentValue) : updater;

      return {
        ...currentState,
        [recipe.id]: nextValue,
      };
    });
  };

  const similarRecipes = recipes
    .filter((candidateRecipe) => candidateRecipe.id !== recipe.id)
    .map((candidateRecipe) => {
      const sharedTags = candidateRecipe.tags[language].filter((tag) =>
        recipe.tags[language].includes(tag),
      ).length;
      const sameCategory = candidateRecipe.category === recipe.category ? 2 : 0;
      const sameRegion = candidateRecipe.region[language] === recipe.region[language] ? 1 : 0;

      return {
        recipe: candidateRecipe,
        score: sharedTags + sameCategory + sameRegion,
      };
    })
    .sort((leftRecipe, rightRecipe) => rightRecipe.score - leftRecipe.score)
    .slice(0, 3);

  return (
    <div className="recipe-detail-page">
      <RecipeDetailHeader recipe={recipe} />
      <main className="recipe-detail-content">
        <RecipeDetailIngredients
          recipe={recipe}
          currentServings={currentServings}
          setCurrentServings={setCurrentServings}
        />
        <RecipeDetailInstructions recipe={recipe} />
      </main>
      <section className="detail-notes">
        <article className="note-card">
          <p className="eyebrow">{t.kitchenNotes}</p>
          <h2>{t.kitchenNotesTitle}</h2>
          <p>
            {t.kitchenNotesBody({
              difficulty: recipe.difficulty[language],
              price: recipe.originalPrice,
            })}
          </p>
        </article>
        <article className="note-card">
          <p className="eyebrow">{t.servingStyle}</p>
          <h2>{t.servingStyleTitle}</h2>
          <p>{recipe.category === "main" ? t.servingStyleMain : t.servingStyleOther}</p>
        </article>
      </section>
      {similarRecipes.length > 0 ? (
        <section className="similar-recipes">
          <div className="section-heading section-heading--subtle">
            <div>
              <p className="eyebrow">{t.similarRecipes}</p>
              <h2>{t.similarRecipes}</h2>
            </div>
            <p>{t.similarRecipesBody}</p>
          </div>
          <div className="recipe-grid">
            {similarRecipes.map(({ recipe: similarRecipe }) => (
              <RecipeCard key={`similar-${similarRecipe.id}`} recipe={similarRecipe} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default RecipeDetailPage;
