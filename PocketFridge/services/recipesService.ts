import { OpenAI } from "openai";

export type InventoryItem = {
  food_type: string;
  quantity: number;
  price?: number;
  category:
    | "vegetable"
    | "fruit"
    | "carbs"
    | "meat"
    | "seafood"
    | "dairy"
    | "condiment"
    | "other";
  date_added: string; // YYYY-MM-DD
  date_expiring: string; // YYYY-MM-DD
};

export type InventoryDict = Record<string, InventoryItem>;

export type GeneratedRecipe = {
  id: string;
  title: string;
  why_this_recipe: string;
  ingredients_used: Array<{ name: string; quantity?: string }>;
  ingredients_optional?: Array<{ name: string; quantity?: string }>;
  steps: string[];
  time_minutes?: number;
  difficulty?: "easy" | "medium" | "hard";
  source_url?: string;
  image_url?: string; // online image for cards + detail header
};

const DEDALUS_API_KEY = process.env.EXPO_PUBLIC_DEDALUS_KEY;

const client = new OpenAI({
  apiKey: DEDALUS_API_KEY,
  baseURL: "https://api.dedaluslabs.ai/v1",
  dangerouslyAllowBrowser: true,
});

/** --------------------------
 * In-memory inventory store
 * -------------------------- */
let inventory: InventoryDict = {};
type InventoryListener = (inv: InventoryDict) => void;
const inventoryListeners = new Set<InventoryListener>();

export function subscribeInventory(listener: InventoryListener): () => void {
  inventoryListeners.add(listener);
  listener({ ...inventory });
  return () => {
    inventoryListeners.delete(listener);
  };
}

function emitInventory() {
  const snapshot = { ...inventory };
  inventoryListeners.forEach((fn) => fn(snapshot));
}

export function getInventory(): InventoryDict {
  return { ...inventory };
}

export function setInventory(next: InventoryDict) {
  inventory = { ...next };
  emitInventory();
}

export function upsertFoods(newFoods: InventoryItem[]) {
  const next = { ...inventory };

  for (const f of newFoods) {
    const key = normalizeKey(f.food_type);
    const existing = next[key];

    if (!existing) {
      next[key] = { ...f, food_type: f.food_type.trim() };
      continue;
    }

    const mergedQty = (existing.quantity ?? 0) + (f.quantity ?? 0);

    const soonerExp =
      compareYYYYMMDD(existing.date_expiring, f.date_expiring) <= 0
        ? existing.date_expiring
        : f.date_expiring;

    next[key] = {
      ...existing,
      quantity: mergedQty,
      date_expiring: soonerExp,
      date_added:
        compareYYYYMMDD(existing.date_added, f.date_added) <= 0
          ? existing.date_added
          : f.date_added,
      category:
        existing.category === "other" && f.category !== "other"
          ? f.category
          : existing.category,
      price: existing.price ?? f.price,
      food_type: existing.food_type || f.food_type,
    };
  }

  setInventory(next);
}

/** --------------------------
 * Demo seed
 * -------------------------- */
export function seedDemoInventoryFromExpirationDays() {
  const today = todayYYYYMMDD();
  const demoRaw: Array<{
    food_type: string;
    quantity: number;
    price: number;
    category: InventoryItem["category"];
    expiration_days: number;
  }> = [
    { food_type: "Diced Tomatoes", quantity: 1, price: 0.67, category: "vegetable", expiration_days: 365 },
    { food_type: "Tomato Paste", quantity: 1, price: 0.75, category: "condiment", expiration_days: 365 },
    { food_type: "Wheat Bread", quantity: 1, price: 4.49, category: "carbs", expiration_days: 7 },
    { food_type: "Parmesan Shredded", quantity: 1, price: 3.89, category: "dairy", expiration_days: 30 },
    { food_type: "Impos Burg", quantity: 1, price: 7.59, category: "other", expiration_days: 7 },
    { food_type: "Boneless Chicken Breast", quantity: 1, price: 12.18, category: "meat", expiration_days: 2 },
    { food_type: "Vanilla Frozen Yogurt", quantity: 1, price: 2, category: "dairy", expiration_days: 30 },
    { food_type: "Limes Persian", quantity: 3, price: 1.74, category: "fruit", expiration_days: 21 },
    { food_type: "Chicken Broth", quantity: 1, price: 5.99, category: "other", expiration_days: 365 },
    { food_type: "Creamy Peanut Butter", quantity: 1, price: 5.75, category: "condiment", expiration_days: 180 },
    { food_type: "Green Beans", quantity: 1, price: 0.89, category: "vegetable", expiration_days: 7 },
    { food_type: "Tomato Ketchup", quantity: 1, price: 6.39, category: "condiment", expiration_days: 180 },
    { food_type: "Green Bell Peppers", quantity: 1, price: 2.84, category: "vegetable", expiration_days: 7 },
    { food_type: "Red Bell Peppers", quantity: 1, price: 2.19, category: "vegetable", expiration_days: 7 },
    { food_type: "Organic Carrots", quantity: 1, price: 1.69, category: "vegetable", expiration_days: 30 },
    { food_type: "Banana Shallots", quantity: 0.2, price: 1.4, category: "vegetable", expiration_days: 30 },
  ];

  const demoFoods: InventoryItem[] = demoRaw.map((x) => ({
    food_type: x.food_type,
    quantity: x.quantity,
    price: x.price,
    category: x.category,
    date_added: today,
    date_expiring: addDaysYYYYMMDD(today, x.expiration_days),
  }));

  upsertFoods(demoFoods);
}

/** --------------------------
 * Recipe cache
 * -------------------------- */
let recipeCache: Record<string, GeneratedRecipe> = {};

export function setRecipeCache(recipes: GeneratedRecipe[]) {
  recipeCache = {};
  for (const r of recipes) recipeCache[r.id] = r;
}

export function getCachedRecipe(id: string): GeneratedRecipe | null {
  return recipeCache[id] ?? null;
}

/** --------------------------
 * Recipe generation
 * -------------------------- */
export async function generateRecipesFromInventory(
  inv: InventoryDict,
  opts?: { count?: number; excludeTitles?: string[] }
): Promise<GeneratedRecipe[]> {
  const count = opts?.count ?? 4;
  const excludeTitles = opts?.excludeTitles ?? [];

  const items = Object.values(inv);
  if (items.length === 0) return [];

  const sorted = [...items].sort((a, b) =>
    compareYYYYMMDD(a.date_expiring, b.date_expiring)
  );
  const topExpiring = sorted.slice(0, Math.min(6, sorted.length));

  const inventoryForPrompt = sorted.map((it) => ({
    food_type: it.food_type,
    quantity: it.quantity,
    category: it.category,
    date_expiring: it.date_expiring,
  }));

  const systemPrompt = `
You are a recipe generator for a "Pocket Fridge" app.
Goal: reduce food waste by prioritizing ingredients closest to expiration.

Rules:
- Assume user already has basics: salt, pepper, oil, butter, water, common spices, and common condiments.
- Use the most-perishable items first (closest date_expiring).
- Generate EXACTLY ${count} DIFFERENT recipes.
- Each recipe must use at least 1 of the top-expiring ingredients.
- Do NOT repeat any recipe titles listed in "Existing recipe titles to avoid repeating".
- Return an image_url that is a DIRECT publicly accessible image link (https://...jpg/png/webp) for the finished dish.
  Prefer Wikimedia/commons or reputable sites that load in an <Image> tag.
  Do NOT return Google redirect links. Do NOT return base64.

Return ONLY valid JSON:
{
  "recipes": [
    {
      "id": "r1",
      "title": "string",
      "why_this_recipe": "string",
      "ingredients_used": [ { "name": "string", "quantity": "string optional" } ],
      "ingredients_optional": [ { "name": "string", "quantity": "string optional" } ],
      "steps": ["string"],
      "time_minutes": 25,
      "difficulty": "easy",
      "source_url": "string optional",
      "image_url": "string"
    }
  ]
}
No markdown. No extra keys.
`;

  const userPrompt = `
Fridge inventory (soonest expiring first):
${JSON.stringify(inventoryForPrompt, null, 2)}

Top expiring to prioritize:
${JSON.stringify(
  topExpiring.map((x) => ({ food_type: x.food_type, date_expiring: x.date_expiring })),
  null,
  2
)}

Existing recipe titles to avoid repeating:
${JSON.stringify(excludeTitles, null, 2)}

Generate ${count} recipes now.
`;

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content ?? "{}";
    const clean = content.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(clean);
    const recipes = Array.isArray(parsed?.recipes) ? parsed.recipes : [];

    const normalized = recipes
      .slice(0, count)
      .map((r: any, idx: number) => normalizeRecipe(r, idx));

    setRecipeCache(normalized);
    return normalized;
  } catch (err: any) {
    console.error("generateRecipesFromInventory failed:", err?.message ?? err);

    const fallback = fallbackRecipes(sorted).slice(0, count);
    setRecipeCache(fallback);
    return fallback;
  }
}

function normalizeRecipe(r: any, idx: number): GeneratedRecipe {
  const safeId = typeof r?.id === "string" ? r.id : `r${idx + 1}`;
  const safeTitle = typeof r?.title === "string" ? r.title : `Recipe ${idx + 1}`;
  const safeWhy =
    typeof r?.why_this_recipe === "string"
      ? r.why_this_recipe
      : "Uses ingredients expiring soon.";

  const safeSteps = Array.isArray(r?.steps)
    ? r.steps.map(String)
    : ["Prep ingredients.", "Cook and serve."];

  const safeUsed = Array.isArray(r?.ingredients_used)
    ? r.ingredients_used.map((x: any) => ({
        name: String(x?.name ?? ""),
        quantity: x?.quantity != null ? String(x.quantity) : undefined,
      }))
    : [];

  const safeOptional = Array.isArray(r?.ingredients_optional)
    ? r.ingredients_optional.map((x: any) => ({
        name: String(x?.name ?? ""),
        quantity: x?.quantity != null ? String(x.quantity) : undefined,
      }))
    : [];

  const time =
    typeof r?.time_minutes === "number" && isFinite(r.time_minutes)
      ? r.time_minutes
      : undefined;

  const difficulty =
    r?.difficulty === "easy" || r?.difficulty === "medium" || r?.difficulty === "hard"
      ? r.difficulty
      : undefined;

  const source =
    typeof r?.source_url === "string" && r.source_url.length > 0
      ? r.source_url
      : undefined;

  let image =
    typeof r?.image_url === "string" && r.image_url.length > 0
      ? r.image_url
      : undefined;

  // ✅ Force fallback image so cards always have photos
  if (!image) {
    image = unsplashFallback(safeTitle);
  }

  return {
    id: safeId,
    title: safeTitle,
    why_this_recipe: safeWhy,
    ingredients_used: safeUsed,
    ingredients_optional: safeOptional,
    steps: safeSteps,
    time_minutes: time,
    difficulty,
    source_url: source,
    image_url: image,
  };
}

function fallbackRecipes(sortedSoonest: InventoryItem[]): GeneratedRecipe[] {
  const names = sortedSoonest.map((x) => x.food_type);
  const pick = (i: number) => names[i] ?? "Your ingredients";

  return [
    {
      id: "r1",
      title: `Chicken & Pepper Skillet`,
      why_this_recipe: `Uses ${pick(0)} and peppers that are expiring soon.`,
      ingredients_used: [{ name: pick(0) }, { name: "Bell peppers" }, { name: "Shallots" }],
      steps: ["Slice ingredients.", "Sauté until cooked.", "Season and serve."],
      time_minutes: 25,
      difficulty: "easy",
      image_url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chicken_fajitas.jpg",
      source_url: "https://en.wikipedia.org/wiki/Fajita",
    },
    {
      id: "r2",
      title: `Green Bean Stir-Fry`,
      why_this_recipe: `Uses green beans before they spoil.`,
      ingredients_used: [{ name: "Green beans" }, { name: "Shallots" }],
      steps: ["Trim beans.", "Stir-fry with aromatics.", "Season and serve."],
      time_minutes: 20,
      difficulty: "easy",
      image_url: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Stir_fry.jpg",
      source_url: "https://en.wikipedia.org/wiki/Stir_frying",
    },
    {
      id: "r3",
      title: `Tomato Parmesan Soup`,
      why_this_recipe: `Uses tomato products and dairy for a quick soup.`,
      ingredients_used: [{ name: "Diced tomatoes" }, { name: "Parmesan" }, { name: "Broth" }],
      steps: ["Simmer tomatoes + broth.", "Blend if desired.", "Finish with parmesan."],
      time_minutes: 30,
      difficulty: "easy",
      image_url: "https://upload.wikimedia.org/wikipedia/commons/9/98/Tomato_soup.jpg",
      source_url: "https://en.wikipedia.org/wiki/Tomato_soup",
    },
    {
      id: "r4",
      title: `Bread & Chicken Sandwich`,
      why_this_recipe: `Uses bread and chicken while they’re freshest.`,
      ingredients_used: [{ name: "Wheat bread" }, { name: "Chicken" }],
      steps: ["Cook chicken.", "Toast bread.", "Assemble and serve."],
      time_minutes: 15,
      difficulty: "easy",
      image_url: "https://upload.wikimedia.org/wikipedia/commons/1/10/Chicken_sandwich.jpg",
      source_url: "https://en.wikipedia.org/wiki/Chicken_sandwich",
    },
  ];
}

/** helpers */
function normalizeKey(foodType: string) {
  return foodType.trim().toLowerCase();
}

function todayYYYYMMDD(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysYYYYMMDD(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map((x) => parseInt(x, 10));
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function compareYYYYMMDD(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function unsplashFallback(query: string) {
  const q = encodeURIComponent(query.replace(/\s+/g, " ").trim());
  return `https://source.unsplash.com/800x600/?${q},food`;
}