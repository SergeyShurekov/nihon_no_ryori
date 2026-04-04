import React, { useState } from "react";
import { recipes } from "../data/recipes";
import { categories } from "../data/categories";
import RecipeCard from "../components/RecipeCard";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const MainPage = () => {
  const { language } = useLanguage();
  const t = ui[language];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const featuredRecipe = recipes[0];
  const visibleCategoryCount =
    selectedCategory === "all"
      ? categories.length
      : categories.filter((category) => category.id === selectedCategory).length;

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title[language]
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            onChange={(e) => setSearchTerm(e.target.value)}
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
          <strong>{filteredRecipes.length}</strong>
          <span>{t.currentResults}</span>
        </article>
      </section>

      <nav className="category-nav">
        <button
          className={`category-btn ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          {t.allCategories}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name[language]}
          </button>
        ))}
      </nav>

      <section className="section-heading">
        <div>
          <p className="eyebrow">{t.recipeSelection}</p>
          <h2>{t.recipeSelectionTitle}</h2>
        </div>
        <p>{t.recipeSelectionBody}</p>
      </section>

      <div className="recipe-grid">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <div className="recipe-empty">
            <h2>{t.noRecipesTitle}</h2>
            <p>{t.noRecipesBody}</p>
          </div>
        )}
      </div>

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
