import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const RECIPES_DIR =
  "c:/Users/shure/OneDrive/Documents/Obsidian Vault/06_Кухня/Рецепты";
const OUTPUT_JSON = new URL("../src/data/recipes.parsed.json", import.meta.url);
const existingRecipes = existsSync(OUTPUT_JSON)
  ? JSON.parse(readFileSync(OUTPUT_JSON, "utf8"))
  : [];
const SKIP_FILES = new Set([
  "00_Продукты на кухне.md",
  "Сякэ-но-Тэрияки Донбури.md", // дубликат полной версии Саке-но Тэрияки
]);

const CATEGORY_MAP = {
  основное: "main",
  main: "main",
  суп: "soup",
  soup: "soup",
  десерт: "dessert",
  dessert: "dessert",
  закуска: "side",
  гарнир: "side",
  side: "side",
};

const GROUP_LABELS = {
  ru: {
    base: "Основа",
    aromatic: "Ароматическая база",
    sauce: "Соус",
    finish: "Финиш",
    toppings: "Топпинги",
    rice: "Основа (рис)",
    sides: "Гарнир",
    other: "Прочее",
  },
  ja: {
    base: "ベース",
    aromatic: "香味ベース",
    sauce: "ソース",
    finish: "仕上げ",
    toppings: "トッピング",
    rice: "ご飯",
    sides: "付け合わせ",
    other: "その他",
  },
};

const detectGroupKey = (heading) => {
  const value = heading.toLowerCase();
  if (/аромат|🧂/.test(value)) return "aromatic";
  if (/соус|мисо-соус|карри|тарэ|🍯/.test(value)) return "sauce";
  if (/финиш|🎌/.test(value)) return "finish";
  if (/топпинг/.test(value)) return "toppings";
  if (/рис|🍚|основа и гарнир/.test(value)) return "rice";
  if (/гарнир|салат|🥒/.test(value)) return "sides";
  if (/основ|баз|🍗|🍆|🍲|🥘/.test(value)) return "base";
  return "other";
};

const CYRILLIC_TO_LATIN = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

const transliterate = (value) =>
  value
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");

const slugify = (value) =>
  transliterate(value)
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const parseFrontmatter = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^([a-z_]+):\s*(.+)$/i);
    if (!pair) continue;
    let value = pair[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      meta[pair[1]] = value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^"|"$/g, ""));
    } else if (/^\d+$/.test(value)) {
      meta[pair[1]] = Number(value);
    } else {
      meta[pair[1]] = value;
    }
  }

  return { meta, body: content.slice(match[0].length) };
};

const extractTitleParts = (body, filename) => {
  const headingMatch = body.match(/^#\s+(.+)$/m);
  const heading = headingMatch?.[1]?.replace(/^[^\p{L}\p{N}]+/u, "").trim() ?? filename;

  const japaneseMatch = heading.match(/([\u3040-\u30ff\u4e00-\u9faf\u3400-\u4dbf]+[^\(\)]*)/u);
  const jaRaw = japaneseMatch?.[1]?.trim() ?? "";
  const ruMatch = heading.match(/\(([^)]+)\)/);
  const ruFromParen = ruMatch?.[1]?.trim();
  const ruTitle =
    ruFromParen ??
    heading
      .replace(/[\u3040-\u30ff\u4e00-\u9faf\u3400-\u4dbf]+/gu, "")
      .replace(/^[\s:：\-–—]+|[\s:：\-–—]+$/g, "")
      .trim();

  return {
    ja: jaRaw || ruTitle,
    ru: ruTitle || jaRaw || heading,
  };
};

const extractDescription = (body) => {
  const match = body.match(
    />\s*\*\*Краткое описание\*\*:\s*([\s\S]*?)(?=\n\n|\n\||\n---|\n##)/,
  );
  if (!match) {
    const alt = body.match(/^\*([^*\n].+)\*$/m);
    return alt?.[1]?.trim() ?? "";
  }
  return match[1].replace(/\s+/g, " ").trim();
};

const parseTableRows = (section) => {
  const lines = section.split("\n").filter((line) => line.trim().startsWith("|"));
  if (lines.length < 2) return [];

  return lines
    .slice(2)
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim().replace(/\*\*/g, "")),
    )
    .filter((row) => row.some(Boolean));
};

const parseParamsTable = (body) => {
  const section = body.match(/\| Параметр \| Значение \|[\s\S]*?(?=\n---|\n##)/);
  if (!section) return {};

  const rows = parseTableRows(section[0]);
  const params = {};
  for (const [key, value] of rows) {
    if (key.includes("Порции")) params.servings = Number(value.replace(/\D/g, "")) || 2;
    if (key.includes("Подготовка")) params.prepTime = Number(value.replace(/\D/g, "")) || 0;
    if (key.includes("Приготовление")) params.cookTime = Number(value.replace(/\D/g, "")) || 0;
    if (key.includes("Сложность")) params.difficulty = value;
    if (key.includes("Кухня")) params.cuisine = value;
    if (key.includes("Сезон")) params.season = value;
  }
  return params;
};

const parseIngredientGroups = (body) => {
  const section = body.match(/##[^\n]*Ингредиенты[\s\S]*?(?=\n## 👨‍🍳|\n## ⚠️|\n## 🍽|\n## ✨|\n## 🔄|\n## 📝|\n## 🔗|$)/);
  if (!section) return [];

  const chunks = section[0].split(/(?=^### )/m).slice(1);
  const groups = [];

  for (const chunk of chunks) {
    const headingMatch = chunk.match(/^###\s+(.+)$/m);
    const heading = headingMatch?.[1]?.trim() ?? "Прочее";
    const key = detectGroupKey(heading);
    const tableRows = parseTableRows(chunk);
    const bulletItems = [...chunk.matchAll(/^-\s+(.+)$/gm)].map((item) => item[1].trim());

    const items =
      tableRows.length > 0
        ? tableRows.map((row) => {
            const ingredient = row[0] ?? "";
            const amount = row[1] ?? "";
            const note = row[2] ?? "";
            return [ingredient, amount, note].filter(Boolean).join(" — ");
          })
        : bulletItems;

    if (items.length === 0) continue;

    groups.push({
      key,
      headingRu: heading.replace(/^[^\p{L}\p{N}]+/u, "").trim(),
      itemsRu: items,
    });
  }

  return groups;
};

const parseInstructionSections = (body) => {
  const section = body.match(/##[^\n]*Пошаговое приготовление[\s\S]*?(?=\n## ⚠️|\n## 🍽|\n## ✨|\n## 🔄|\n## 📝|\n## 🔗|$)/);
  if (!section) return [];

  const chunks = section[0].split(/(?=^### )/m).slice(1);
  const sections = [];

  for (const chunk of chunks) {
    const titleMatch = chunk.match(/^###\s+(.+)$/m);
    const title = titleMatch?.[1]?.trim() ?? "Шаги";
    const steps = [...chunk.matchAll(/^\d+\.\s+(.+)$/gm)].map((item) => item[1].trim());
    const tips = [
      ...chunk.matchAll(/^>\s*[🎯💡⚠️]?\s*\*\*(.+?)\*\*:\s*(.+)$/gm),
    ].map((item) => `${item[1]}: ${item[2].trim()}`);

    if (steps.length === 0 && /^\*\*.+\*\*/m.test(chunk)) {
      const subSteps = [...chunk.matchAll(/^\*\*(.+?)\*\*\s*\n([\s\S]*?)(?=^\*\*|^>|^$)/gm)];
      for (const sub of subSteps) {
        const subTitle = sub[1].trim();
        const subChunk = sub[2];
        const subStepItems = [...subChunk.matchAll(/^\d+\.\s+(.+)$/gm)].map((item) =>
          item[1].trim(),
        );
        if (subStepItems.length > 0) {
          sections.push({ titleRu: subTitle, stepsRu: subStepItems, tipsRu: [] });
        }
      }
      continue;
    }

    if (steps.length > 0) {
      sections.push({ titleRu: title, stepsRu: steps, tipsRu: tips });
    }
  }

  return sections;
};

const parseMistakes = (body) => {
  const section = body.match(/## ⚠️[^\n]*[\s\S]*?(?=\n## |\n---|$)/);
  if (!section) return [];
  const rows = parseTableRows(section[0]);
  return rows.map(([mistake, consequence, solution]) => ({
    mistakeRu: mistake,
    consequenceRu: consequence,
    solutionRu: solution,
  }));
};

const parseServingProfile = (body) => {
  const section = body.match(/## 🍽[^\n]*[\s\S]*?(?=\n## |\n---|$)/);
  if (!section) return [];
  const rows = parseTableRows(section[0]);
  return rows.map(([aspect, description]) => ({
    aspectRu: aspect,
    descriptionRu: description,
  }));
};

const parseBulletSection = (body, emoji) => {
  const section = body.match(new RegExp(`## ${emoji}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |\\n---|$)`));
  if (!section?.[1]) return [];
  return [...section[1].matchAll(/^-\s+\*\*(.+?)\*\*:\s*(.+)$/gm)].map(
    (item) => `${item[1]}: ${item[2].trim()}`,
  );
};

const parseStorage = (body) => {
  const section = body.match(/## 🔄[^\n]*[\s\S]*?(?=\n## |\n---|$)/);
  if (!section) return [];
  const rows = parseTableRows(section[0]);
  return rows.map(([component, storage, reheating]) => ({
    componentRu: component,
    storageRu: storage,
    reheatingRu: reheating,
  }));
};

const parseRelated = (body) => {
  const section = body.match(/## 🔗[^\n]*[\s\S]*?(?=\n## |\n---|$)/);
  if (!section?.[0]) return [];
  return [...section[0].matchAll(/^-\s+\[\[(.+?)\]\]/gm)].map((item) => item[1].trim());
};

const extractPantryTerms = (groups) =>
  groups
    .flatMap((group) => group.itemsRu)
    .map((item) => item.split("—")[0]?.split(",")[0]?.trim())
    .filter(Boolean)
    .slice(0, 12);

const extractTags = (meta, titleRu) => {
  const fromMeta = Array.isArray(meta.tags)
    ? meta.tags.map((tag) => tag.replace(/^#/, ""))
    : [];
  if (fromMeta.length > 0) return fromMeta.slice(0, 6);
  return titleRu
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 4);
};

const difficultyToLocalized = (value) => {
  const stars = (value.match(/⭐/g) ?? []).length;
  if (stars <= 1 || /начал|★☆☆|лёгк|легк/i.test(value)) {
    return { ja: "初級", ru: "Начальный" };
  }
  if (stars >= 4 || /сложн|продвин/i.test(value)) {
    return { ja: "上級", ru: "Сложная" };
  }
  return { ja: "中級", ru: "Средняя" };
};

const hasJapaneseContent = (value) =>
  Array.isArray(value)
    ? value.length > 0
    : typeof value === "string"
      ? value.trim() !== ""
      : Boolean(value);

const preserveJapanese = (value, previous) => {
  if (Array.isArray(value)) {
    return value.map((item, index) => preserveJapanese(item, previous?.[index]));
  }
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => {
      if (key === "ja") {
        const previousJapanese = previous?.ja;
        return [
          key,
          hasJapaneseContent(previousJapanese) ? previousJapanese : Array.isArray(child) ? [] : "",
        ];
      }
      return [key, preserveJapanese(child, previous?.[key])];
    }),
  );
};

const parseRecipeFile = (filepath) => {
  const filename = basename(filepath);
  if (SKIP_FILES.has(filename)) return null;

  const raw = readFileSync(filepath, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const title = extractTitleParts(body, filename.replace(/\.md$/i, ""));
  const descriptionRu = extractDescription(body);
  const params = parseParamsTable(body);
  const ingredientGroups = parseIngredientGroups(body);
  const instructionSections = parseInstructionSections(body);

  const prepTime = meta.prep_time ?? params.prepTime ?? 0;
  const cookTime = meta.cook_time ?? params.cookTime ?? 0;
  const totalTime = meta.total_time ?? (prepTime + cookTime || 30);
  const servings = meta.servings ?? params.servings ?? 2;
  const difficulty = difficultyToLocalized(params.difficulty ?? "⭐⭐☆☆☆");
  const dishType = String(meta.dish_type ?? "").toLowerCase();
  const category = CATEGORY_MAP[dishType] ?? "main";
  const seasonRu = params.season ?? "Круглый год";
  const cuisineRu = params.cuisine ?? "Японская, катэ-рёри";
  const id = slugify(title.ru || title.ja || filename);

  const flatIngredientsRu = ingredientGroups.flatMap((group) => group.itemsRu);
  const flatStepsRu = instructionSections.flatMap((section) => section.stepsRu);
  const existingRecipe = existingRecipes.find((recipe) => recipe.id === id);
  const descriptionJa =
    existingRecipe?.description?.ja && existingRecipe.description.ja !== descriptionRu
      ? existingRecipe.description.ja
      : "";

  const recipe = {
    id,
    sourceFile: filename,
    title,
    description: { ru: descriptionRu, ja: descriptionJa },
    category,
    image: "",
    prepTime,
    cookTime,
    time: totalTime,
    servings,
    originalPrice: 0,
    difficulty,
    cuisine: { ru: cuisineRu, ja: "和食・家庭料理" },
    region: { ru: "Домашняя кухня", ja: "家庭料理" },
    season: { ru: seasonRu, ja: seasonRu.includes("лет") ? "夏" : seasonRu.includes("зим") ? "冬" : "通年" },
    tags: {
      ru: extractTags(meta, title.ru),
      ja: extractTags(meta, title.ru),
    },
    pantryTerms: {
      ru: extractPantryTerms(ingredientGroups),
      ja: extractPantryTerms(ingredientGroups),
    },
    ingredientGroups: ingredientGroups.map((group) => ({
      key: group.key,
      name: {
        ru: group.headingRu || GROUP_LABELS.ru[group.key],
        ja: GROUP_LABELS.ja[group.key],
      },
      items: {
        ru: group.itemsRu,
        ja: group.itemsRu,
      },
    })),
    instructionSections: instructionSections.map((section) => ({
      title: { ru: section.titleRu, ja: section.titleRu },
      steps: { ru: section.stepsRu, ja: section.stepsRu },
      tips: { ru: section.tipsRu, ja: section.tipsRu },
    })),
    commonMistakes: parseMistakes(body).map((item) => ({
      mistake: { ru: item.mistakeRu, ja: item.mistakeRu },
      consequence: { ru: item.consequenceRu, ja: item.consequenceRu },
      solution: { ru: item.solutionRu, ja: item.solutionRu },
    })),
    servingProfile: parseServingProfile(body).map((item) => ({
      aspect: { ru: item.aspectRu, ja: item.aspectRu },
      description: { ru: item.descriptionRu, ja: item.descriptionRu },
    })),
    upgrades: {
      ru: parseBulletSection(body, "✨"),
      ja: parseBulletSection(body, "✨"),
    },
    storage: parseStorage(body).map((item) => ({
      component: { ru: item.componentRu, ja: item.componentRu },
      storage: { ru: item.storageRu, ja: item.storageRu },
      reheating: { ru: item.reheatingRu, ja: item.reheatingRu },
    })),
    adaptations: {
      ru: parseBulletSection(body, "📝"),
      ja: parseBulletSection(body, "📝"),
    },
    relatedRecipes: parseRelated(body),
    ingredients: { ru: flatIngredientsRu, ja: flatIngredientsRu },
    instructions: { ru: flatStepsRu, ja: flatStepsRu },
  };

  return preserveJapanese(recipe, existingRecipe);
};

const files = readdirSync(RECIPES_DIR)
  .filter((name) => name.endsWith(".md"))
  .map((name) => join(RECIPES_DIR, name));

const recipes = [];
const seenIds = new Set();

for (const filepath of files) {
  const recipe = parseRecipeFile(filepath);
  if (!recipe) continue;

  let uniqueId = recipe.id;
  let suffix = 2;
  while (seenIds.has(uniqueId)) {
    uniqueId = `${recipe.id}-${suffix}`;
    suffix += 1;
  }
  recipe.id = uniqueId;
  seenIds.add(uniqueId);
  recipes.push(recipe);
}

recipes.sort((left, right) => left.title.ru.localeCompare(right.title.ru, "ru"));

writeFileSync(OUTPUT_JSON, JSON.stringify(recipes, null, 2), "utf8");
console.log(`Parsed ${recipes.length} recipes -> ${OUTPUT_JSON.pathname}`);
