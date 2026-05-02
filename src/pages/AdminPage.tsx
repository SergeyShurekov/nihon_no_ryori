import { FormEvent, useMemo, useState } from "react";
import { categories } from "../data/categories";
import { useLanguage } from "../context/useLanguage";
import { useRecipeCatalog } from "../context/useRecipeCatalog";
import { ui } from "../i18n/translations";
import type { Recipe } from "../types";

const DEFAULT_IMAGE = "/favicon.svg";

const splitLines = (value: string): string[] =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const createInitialForm = (): Omit<Recipe, "id"> => ({
  title: { ja: "", ru: "" },
  description: { ja: "", ru: "" },
  category: "main",
  image: DEFAULT_IMAGE,
  time: 30,
  servings: 2,
  originalPrice: 500,
  difficulty: { ja: "", ru: "" },
  region: { ja: "", ru: "" },
  season: { ja: "", ru: "" },
  tags: { ja: [], ru: [] },
  pantryTerms: { ja: [], ru: [] },
  ingredients: { ja: [], ru: [] },
  instructions: { ja: [], ru: [] },
});

type AdminFieldErrorKey =
  | "time"
  | "servings"
  | "originalPrice"
  | "title.ja"
  | "title.ru"
  | "description.ja"
  | "description.ru"
  | "difficulty.ja"
  | "difficulty.ru"
  | "region.ja"
  | "region.ru"
  | "season.ja"
  | "season.ru"
  | "tags.ja"
  | "tags.ru"
  | "pantryTerms.ja"
  | "pantryTerms.ru"
  | "ingredients.ja"
  | "ingredients.ru"
  | "instructions.ja"
  | "instructions.ru";

type AdminFieldErrors = Partial<Record<AdminFieldErrorKey, string>>;

const AdminPage = () => {
  const { language } = useLanguage();
  const { addRecipe, customRecipes, updateRecipe, deleteRecipe } = useRecipeCatalog();
  const t = ui[language];
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AdminFieldErrors>({});
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [formState, setFormState] = useState(createInitialForm);

  const isEditing = editingRecipeId !== null;
  const submitLabel = isEditing ? t.adminUpdate : t.adminSubmit;
  const formTitle = isEditing ? t.adminEditingTitle : t.adminFormTitle;

  const customRecipesCountText = useMemo(
    () => (customRecipes.length === 0 ? t.adminSavedEmpty : t.adminDescription),
    [customRecipes.length, t.adminDescription, t.adminSavedEmpty],
  );

  const validateForm = (): AdminFieldErrors => {
    const nextErrors: AdminFieldErrors = {};

    const requireText = (key: Exclude<AdminFieldErrorKey, "time" | "servings" | "originalPrice">) => {
      const [field, locale] = key.split(".") as [
        "title" | "description" | "difficulty" | "region" | "season" | "tags" | "pantryTerms" | "ingredients" | "instructions",
        "ja" | "ru",
      ];
      const fieldValue = formState[field][locale];

      if (Array.isArray(fieldValue)) {
        if (fieldValue.length === 0) {
          nextErrors[key] = t.adminValidationRequired;
        }
        return;
      }

      if (!fieldValue.trim()) {
        nextErrors[key] = t.adminValidationRequired;
      }
    };

    const requirePositiveNumber = (key: "time" | "servings" | "originalPrice") => {
      if (formState[key] <= 0 || Number.isNaN(formState[key])) {
        nextErrors[key] = t.adminValidationPositiveNumber;
      }
    };

    requirePositiveNumber("time");
    requirePositiveNumber("servings");
    requirePositiveNumber("originalPrice");

    [
      "title.ja",
      "title.ru",
      "description.ja",
      "description.ru",
      "difficulty.ja",
      "difficulty.ru",
      "region.ja",
      "region.ru",
      "season.ja",
      "season.ru",
      "tags.ja",
      "tags.ru",
      "pantryTerms.ja",
      "pantryTerms.ru",
      "ingredients.ja",
      "ingredients.ru",
      "instructions.ja",
      "instructions.ru",
    ].forEach((key) => requireText(key as Exclude<AdminFieldErrorKey, "time" | "servings" | "originalPrice">));

    return nextErrors;
  };

  const clearFieldError = (field: AdminFieldErrorKey) => {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
    setErrorMessage("");
  };

  const resetForm = () => {
    setFormState(createInitialForm());
    setEditingRecipeId(null);
    setFieldErrors({});
    setErrorMessage("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm();
    const hasErrors = Object.keys(nextErrors).length > 0;

    if (hasErrors) {
      setFieldErrors(nextErrors);
      setErrorMessage(t.adminValidationSummary);
      setSuccessMessage("");
      return;
    }

    const nextRecipe = {
      ...formState,
      image: formState.image || DEFAULT_IMAGE,
    };

    if (editingRecipeId) {
      updateRecipe(editingRecipeId, nextRecipe);
      setSuccessMessage(t.adminUpdated);
    } else {
      addRecipe(nextRecipe);
      setSuccessMessage(t.adminSuccess);
    }

    setFieldErrors({});
    setErrorMessage("");
    resetForm();
  };

  const startEditing = (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setFormState({
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      image: recipe.image,
      time: recipe.time,
      servings: recipe.servings,
      originalPrice: recipe.originalPrice,
      difficulty: recipe.difficulty,
      region: recipe.region,
      season: recipe.season,
      tags: recipe.tags,
      pantryTerms: recipe.pantryTerms,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
    });
    setSuccessMessage("");
    setErrorMessage("");
    setFieldErrors({});
  };

  const removeRecipe = (recipeId: string) => {
    const recipeToDelete = customRecipes.find((recipe) => recipe.id === recipeId);
    const recipeTitle = recipeToDelete?.title[language] ?? "";

    if (!window.confirm(t.adminDeleteConfirm(recipeTitle))) {
      return;
    }

    deleteRecipe(recipeId);
    if (editingRecipeId === recipeId) {
      resetForm();
    }
    setSuccessMessage(t.adminDeleted);
    setErrorMessage("");
  };

  const updateLocalizedField = (
    field: "title" | "description" | "difficulty" | "region" | "season",
    locale: "ja" | "ru",
    value: string,
  ) => {
    setFormState((currentState) => ({
      ...currentState,
      [field]: {
        ...currentState[field],
        [locale]: value,
      },
    }));
    clearFieldError(`${field}.${locale}` as AdminFieldErrorKey);
  };

  const updateLocalizedList = (
    field: "tags" | "pantryTerms" | "ingredients" | "instructions",
    locale: "ja" | "ru",
    value: string,
  ) => {
    setFormState((currentState) => ({
      ...currentState,
      [field]: {
        ...currentState[field],
        [locale]: splitLines(value),
      },
    }));
    clearFieldError(`${field}.${locale}` as AdminFieldErrorKey);
  };

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <p className="eyebrow">Recipe Admin</p>
        <h1>{t.adminTitle}</h1>
        <p>{t.adminDescription}</p>
      </section>

      <section className="admin-layout">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="section-heading section-heading--subtle">
            <div>
              <p className="eyebrow">{formTitle}</p>
              <h2>{formTitle}</h2>
            </div>
            <p>{t.adminTextareaHint}</p>
          </div>

          <div className="admin-grid">
            <label className="admin-field">
              <span>{t.adminFieldImage}</span>
              <input
                aria-label={t.adminFieldImage}
                className="search-input"
                value={formState.image === DEFAULT_IMAGE ? "" : formState.image}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    image: event.target.value || DEFAULT_IMAGE,
                  }))
                }
              />
            </label>

            <label className="admin-field">
              <span>{t.adminFieldCategory}</span>
              <select
                aria-label={t.adminFieldCategory}
                className="admin-select"
                value={formState.category}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    category: event.target.value as Recipe["category"],
                  }))
                }
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name[language]}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>{t.adminFieldTime}</span>
              <input
                aria-label={t.adminFieldTime}
                aria-invalid={Boolean(fieldErrors.time)}
                type="number"
                className="search-input"
                value={formState.time}
                onChange={(event) =>
                  {
                    setFormState((currentState) => ({
                      ...currentState,
                      time: Number(event.target.value),
                    }));
                    clearFieldError("time");
                  }
                }
              />
              {fieldErrors.time ? <span className="admin-error">{fieldErrors.time}</span> : null}
            </label>

            <label className="admin-field">
              <span>{t.adminFieldServings}</span>
              <input
                aria-label={t.adminFieldServings}
                aria-invalid={Boolean(fieldErrors.servings)}
                type="number"
                className="search-input"
                value={formState.servings}
                onChange={(event) =>
                  {
                    setFormState((currentState) => ({
                      ...currentState,
                      servings: Number(event.target.value),
                    }));
                    clearFieldError("servings");
                  }
                }
              />
              {fieldErrors.servings ? (
                <span className="admin-error">{fieldErrors.servings}</span>
              ) : null}
            </label>

            <label className="admin-field">
              <span>{t.adminFieldPrice}</span>
              <input
                aria-label={t.adminFieldPrice}
                aria-invalid={Boolean(fieldErrors.originalPrice)}
                type="number"
                className="search-input"
                value={formState.originalPrice}
                onChange={(event) =>
                  {
                    setFormState((currentState) => ({
                      ...currentState,
                      originalPrice: Number(event.target.value),
                    }));
                    clearFieldError("originalPrice");
                  }
                }
              />
              {fieldErrors.originalPrice ? (
                <span className="admin-error">{fieldErrors.originalPrice}</span>
              ) : null}
            </label>

            <label className="admin-field">
              <span>{t.adminFieldTitleJa}</span>
              <input
                aria-label={t.adminFieldTitleJa}
                aria-invalid={Boolean(fieldErrors["title.ja"])}
                className="search-input"
                value={formState.title.ja}
                onChange={(event) => updateLocalizedField("title", "ja", event.target.value)}
              />
              {fieldErrors["title.ja"] ? (
                <span className="admin-error">{fieldErrors["title.ja"]}</span>
              ) : null}
            </label>

            <label className="admin-field">
              <span>{t.adminFieldTitleRu}</span>
              <input
                aria-label={t.adminFieldTitleRu}
                aria-invalid={Boolean(fieldErrors["title.ru"])}
                className="search-input"
                value={formState.title.ru}
                onChange={(event) => updateLocalizedField("title", "ru", event.target.value)}
              />
              {fieldErrors["title.ru"] ? (
                <span className="admin-error">{fieldErrors["title.ru"]}</span>
              ) : null}
            </label>
          </div>

          {[
            ["description", t.adminFieldDescriptionJa, "ja"],
            ["description", t.adminFieldDescriptionRu, "ru"],
            ["difficulty", t.adminFieldDifficultyJa, "ja"],
            ["difficulty", t.adminFieldDifficultyRu, "ru"],
            ["region", t.adminFieldRegionJa, "ja"],
            ["region", t.adminFieldRegionRu, "ru"],
            ["season", t.adminFieldSeasonJa, "ja"],
            ["season", t.adminFieldSeasonRu, "ru"],
          ].map(([field, label, locale]) => (
            <label className="admin-field" key={`${field}-${locale}`}>
              <span>{label}</span>
              <textarea
                aria-label={label}
                aria-invalid={Boolean(
                  fieldErrors[
                    `${field}.${locale}` as AdminFieldErrorKey
                  ],
                )}
                className="admin-textarea"
                value={formState[field as "description" | "difficulty" | "region" | "season"][
                  locale as "ja" | "ru"
                ]}
                onChange={(event) =>
                  updateLocalizedField(
                    field as "description" | "difficulty" | "region" | "season",
                    locale as "ja" | "ru",
                    event.target.value,
                  )
                }
              />
              {fieldErrors[`${field}.${locale}` as AdminFieldErrorKey] ? (
                <span className="admin-error">
                  {fieldErrors[`${field}.${locale}` as AdminFieldErrorKey]}
                </span>
              ) : null}
            </label>
          ))}

          {[
            ["tags", t.adminFieldTagsJa, "ja"],
            ["tags", t.adminFieldTagsRu, "ru"],
            ["pantryTerms", t.adminFieldPantryJa, "ja"],
            ["pantryTerms", t.adminFieldPantryRu, "ru"],
            ["ingredients", t.adminFieldIngredientsJa, "ja"],
            ["ingredients", t.adminFieldIngredientsRu, "ru"],
            ["instructions", t.adminFieldInstructionsJa, "ja"],
            ["instructions", t.adminFieldInstructionsRu, "ru"],
          ].map(([field, label, locale]) => (
            <label className="admin-field" key={`${field}-${locale}`}>
              <span>{label}</span>
              <textarea
                aria-label={label}
                aria-invalid={Boolean(
                  fieldErrors[
                    `${field}.${locale}` as AdminFieldErrorKey
                  ],
                )}
                className="admin-textarea"
                value={formState[field as "tags" | "pantryTerms" | "ingredients" | "instructions"][
                  locale as "ja" | "ru"
                ].join("\n")}
                onChange={(event) =>
                  updateLocalizedList(
                    field as "tags" | "pantryTerms" | "ingredients" | "instructions",
                    locale as "ja" | "ru",
                    event.target.value,
                  )
                }
              />
              {fieldErrors[`${field}.${locale}` as AdminFieldErrorKey] ? (
                <span className="admin-error">
                  {fieldErrors[`${field}.${locale}` as AdminFieldErrorKey]}
                </span>
              ) : null}
            </label>
          ))}

          <div className="admin-actions">
            <button type="submit" className="admin-submit">
              {submitLabel}
            </button>
            {isEditing ? (
              <button
                type="button"
                className="admin-cancel"
                onClick={() => {
                  resetForm();
                  setSuccessMessage("");
                }}
              >
                {t.adminCancel}
              </button>
            ) : null}
          </div>

          {errorMessage ? <p className="admin-error-summary">{errorMessage}</p> : null}
          {successMessage ? <p className="admin-success">{successMessage}</p> : null}
        </form>

        <aside className="admin-sidebar">
          <div className="about-card">
            <p className="eyebrow">{t.adminSavedTitle}</p>
            <h2>{customRecipes.length}</h2>
            <p>{customRecipesCountText}</p>
          </div>
          {customRecipes.map((recipe) => (
            <article key={recipe.id} className="admin-recipe-item">
              <h3>{recipe.title[language]}</h3>
              <p>{recipe.description[language]}</p>
              <div className="admin-recipe-item__actions">
                <button
                  type="button"
                  className="category-btn"
                  onClick={() => startEditing(recipe)}
                >
                  {t.adminEdit}
                </button>
                <button
                  type="button"
                  className="admin-delete"
                  onClick={() => removeRecipe(recipe.id)}
                >
                  {t.adminDelete}
                </button>
              </div>
            </article>
          ))}
        </aside>
      </section>
    </div>
  );
};

export default AdminPage;
