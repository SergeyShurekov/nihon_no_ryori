import { useMemo, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import { useFavorites } from "../context/useFavorites";
import { useLanguage } from "../context/useLanguage";
import { useRecipeCatalog } from "../context/useRecipeCatalog";
import { categories } from "../data/categories";
import { ui } from "../i18n/translations";
import type { Recipe } from "../types";

const normalizeTerm = (value: string): string => value.trim().toLowerCase();

interface PantryMatch {
  recipe: Recipe;
  missingIngredients: string[];
  matchedIngredientsCount: number;
}

const MainPage = () => {
  const { language } = useLanguage();
  const { favorites } = useFavorites();
  const { recipes } = useRecipeCatalog();
  const t = ui[language];
  const [searchTerm, setSearchTerm] = useState("");
  const [pantryInput, setPantryInput] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Recipe["category"] | "all">("all");
  const featuredRecipe = recipes[0];
  const visibleCategoryCount =
    selectedCategory === "all"
      ? categories.length
      : categories.filter((category) => category.id === selectedCategory).length;
  const availableIngredients = pantryInput
    .split(/[,،、;]/)
    .map(normalizeTerm)
    .filter(Boolean);
  const pantryModeEnabled = availableIngredients.length > 0;

  const filteredRecipes = useMemo(
    () =>
      recipes.filter((recipe) => {
        const searchValue = searchTerm.toLowerCase();
        const searchPool = [
          recipe.title[language],
          recipe.description[language],
          ...recipe.tags[language],
          ...recipe.ingredients[language],
          ...recipe.pantryTerms[language],
        ]
          .join(" ")
          .toLowerCase();
        const matchesSearch = searchPool.includes(searchValue);
        const matchesCategory =
          selectedCategory === "all" || recipe.category === selectedCategory;
        const matchesFavorites = !favoritesOnly || favorites.includes(recipe.id);

        return matchesSearch && matchesCategory && matchesFavorites;
      }),
    [favorites, favoritesOnly, language, recipes, searchTerm, selectedCategory],
  );

  const pantryRecipes = useMemo<PantryMatch[]>(
    () =>
      filteredRecipes
        .map((recipe) => {
          const missingIngredients = recipe.pantryTerms[language].filter(
            (requiredIngredient) =>
              !availableIngredients.some((availableIngredient) => {
                const normalizedRequired = normalizeTerm(requiredIngredient);
                return (
                  availableIngredient.includes(normalizedRequired) ||
                  normalizedRequired.includes(availableIngredient)
                );
              }),
          );
          const matchedIngredientsCount =
            recipe.pantryTerms[language].length - missingIngredients.length;

          return {
            recipe,
            missingIngredients,
            matchedIngredientsCount,
          };
        })
        .sort((leftRecipe, rightRecipe) => {
          if (leftRecipe.missingIngredients.length !== rightRecipe.missingIngredients.length) {
            return leftRecipe.missingIngredients.length - rightRecipe.missingIngredients.length;
          }

          return rightRecipe.matchedIngredientsCount - leftRecipe.matchedIngredientsCount;
        }),
    [availableIngredients, filteredRecipes, language],
  );

  const exactRecipes = pantryModeEnabled
    ? pantryRecipes.filter(({ missingIngredients }) => missingIngredients.length === 0)
    : filteredRecipes.map((recipe) => ({ recipe, missingIngredients: [], matchedIngredientsCount: 0 }));
  const nearRecipes = pantryModeEnabled
    ? pantryRecipes.filter(
        ({ matchedIngredientsCount, missingIngredients }) =>
          matchedIngredientsCount > 0 && missingIngredients.length > 0,
      )
    : [];
  const visibleResultsCount = pantryModeEnabled
    ? exactRecipes.length + nearRecipes.length
    : exactRecipes.length;

  return (
    <div className="main-page" id="catalog">
      <section className="main-hero">
        <div className="main-header">
          <p className="eyebrow">Nihon no Ryori</p>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroDescription}</p>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="search-input"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <aside className="hero-panel">
          <p className="hero-label">{t.featuredDish}</p>
          <h2>{featuredRecipe.title[language]}</h2>
          <p>{featuredRecipe.description[language]}</p>
          <div className="hero-meta">
            <span>{featuredRecipe.region[language]}</span>
            <span>{featuredRecipe.season[language]}</span>
            <span>{featuredRecipe.difficulty[language]}</span>
          </div>
        </aside>
      </section>

      <section className="stats-row" aria-label={t.catalogStats}>
        <article className="stat-card">
          <strong>{recipes.length}</strong>
          <span>{t.recipesCount}</span>
        </article>
        <article className="stat-card">
          <strong>{categories.length}</strong>
          <span>{t.categoriesCount}</span>
        </article>
        <article className="stat-card">
          <strong>{visibleCategoryCount}</strong>
          <span>{t.visibleCategories}</span>
        </article>
        <article className="stat-card">
          <strong>{visibleResultsCount}</strong>
          <span>{t.currentResults}</span>
        </article>
        <article className="stat-card">
          <strong>{favorites.length}</strong>
          <span>{t.favoritesCount}</span>
        </article>
        <article className="stat-card">
          <strong>{nearRecipes.length}</strong>
          <span>{t.nearMatchesCount}</span>
        </article>
      </section>

      <section className="pantry-panel">
        <div className="pantry-panel__copy">
          <p className="eyebrow">{t.pantrySearchTitle}</p>
          <h2>{t.pantrySearchTitle}</h2>
          <p>{t.pantrySearchBody}</p>
        </div>
        <div className="pantry-panel__controls">
          <input
            type="text"
            placeholder={t.pantryPlaceholder}
            className="search-input"
            value={pantryInput}
            onChange={(event) => setPantryInput(event.target.value)}
          />
          <p className="pantry-hint">{t.pantryHint}</p>
          <button
            type="button"
            className={`category-btn ${favoritesOnly ? "active" : ""}`}
            onClick={() => setFavoritesOnly((currentValue) => !currentValue)}
          >
            {t.favoritesOnly}
          </button>
        </div>
      </section>

      <nav className="category-nav">
        <button
          className={`category-btn ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          {t.allCategories}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name[language]}
          </button>
        ))}
      </nav>

      <section className="section-heading">
        <div>
          <p className="eyebrow">
            {pantryModeEnabled ? t.pantryReadyTitle : t.recipeSelection}
          </p>
          <h2>{pantryModeEnabled ? t.pantryReadyTitle : t.recipeSelectionTitle}</h2>
        </div>
        <p>{pantryModeEnabled ? t.pantryReadyBody : t.recipeSelectionBody}</p>
      </section>

      <div className="recipe-grid">
        {exactRecipes.length > 0 ? (
          exactRecipes.map(({ recipe, missingIngredients }) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              missingIngredients={missingIngredients}
            />
          ))
        ) : (
          <div className="recipe-empty">
            <h2>{pantryModeEnabled ? t.noExactPantryTitle : t.noRecipesTitle}</h2>
            <p>{pantryModeEnabled ? t.noExactPantryBody : t.noRecipesBody}</p>
          </div>
        )}
      </div>

      {nearRecipes.length > 0 ? (
        <>
          <section className="section-heading section-heading--subtle">
            <div>
              <p className="eyebrow">{t.nearMatchesTitle}</p>
              <h2>{t.nearMatchesTitle}</h2>
            </div>
            <p>{t.nearMatchesBody}</p>
          </section>

          <div className="recipe-grid">
            {nearRecipes.map(({ recipe, missingIngredients }) => (
              <RecipeCard
                key={`${recipe.id}-near`}
                recipe={recipe}
                missingIngredients={missingIngredients}
              />
            ))}
          </div>
        </>
      ) : null}

      <section className="about-section" id="about">
        <div className="about-card">
          <p className="eyebrow">{t.aboutProject}</p>
          <h2>{t.aboutTitle}</h2>
          <p>{t.aboutBody}</p>
        </div>
      </section>
    </div>
  );
};

export default MainPage;
