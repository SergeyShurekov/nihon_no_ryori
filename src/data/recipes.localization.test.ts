import recipes from "./recipes.parsed.json";

describe("recipe localization", () => {
  it("does not reuse non-empty Russian descriptions as Japanese descriptions", () => {
    const duplicatedDescriptions = recipes.filter(
      (recipe) =>
        recipe.description.ru.trim() !== "" &&
        recipe.description.ja.trim() !== "" &&
        recipe.description.ru === recipe.description.ja,
    );

    expect(duplicatedDescriptions).toEqual([]);
  });

  it("does not contain Cyrillic text in Japanese fields", () => {
    const cyrillic = /[А-Яа-яЁё]/;
    const paths: string[] = [];

    const visit = (value: unknown, path: string) => {
      if (typeof value === "string") {
        if (cyrillic.test(value)) paths.push(path);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item, index) => visit(item, `${path}[${index}]`));
        return;
      }
      if (value && typeof value === "object") {
        Object.entries(value).forEach(([key, child]) => {
          if (key === "ja") visit(child, `${path}.ja`);
        });
      }
    };

    recipes.forEach((recipe) => visit(recipe, recipe.id));
    expect(paths).toEqual([]);
  });
});
