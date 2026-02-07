// recipes.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import FilterIcon from "../../assets/icons/filter.svg";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Modal,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  GeneratedRecipe,
  subscribeInventory,
  seedDemoInventoryFromExpirationDays,
  generateRecipesFromInventory,
  InventoryDict,
} from "../../services/recipesService";

const COLORS = {
  yellow: "#FFCF20",
  darkGreen: "#285B23",
  darkGreen2: "#1B3F18", // gradient bottom
  lightGreen: "#B2D459",
  offWhite: "#FEFFDE",
};

const CONTENT_RIGHT_INSET = 12;

/**
 * ✅ Local stock food images (static require) — MUST be hardcoded.
 * Path matches: assets/images/food/<file>.png
 */
type FoodKey =
  | "beefsteak"
  | "broccoli"
  | "butter"
  | "carrot"
  | "chickenbreast"
  | "chickenbroth"
  | "cucumber"
  | "egg"
  | "garlic"
  | "greenbean"
  | "greenbellpepper"
  | "heavycream"
  | "impossibleburger"
  | "jalapeno"
  | "ketchup"
  | "lime"
  | "milk"
  | "parmesan"
  | "peanutbutter"
  | "potato"
  | "redbellpepper"
  | "rigatoni"
  | "salmon"
  | "shallot"
  | "shrimp"
  | "spaghetti"
  | "tomato"
  | "tomatopaste"
  | "wheatbread"
  | "yogurt";

const FOOD_IMAGES: Record<FoodKey, ImageSourcePropType> = {
  beefsteak: require("../../assets/images/food/beefsteak.png"),
  broccoli: require("../../assets/images/food/broccoli.png"),
  butter: require("../../assets/images/food/butter.png"),
  carrot: require("../../assets/images/food/carrot.png"),
  chickenbreast: require("../../assets/images/food/chickenbreast.png"),
  chickenbroth: require("../../assets/images/food/chickenbroth.png"),
  cucumber: require("../../assets/images/food/cucumber.png"),
  egg: require("../../assets/images/food/egg.png"),
  garlic: require("../../assets/images/food/garlic.png"),
  greenbean: require("../../assets/images/food/greenbean.png"),
  greenbellpepper: require("../../assets/images/food/greenbellpepper.png"),
  heavycream: require("../../assets/images/food/heavycream.png"),
  impossibleburger: require("../../assets/images/food/impossibleburger.png"),
  jalapeno: require("../../assets/images/food/jalapeno.png"),
  ketchup: require("../../assets/images/food/ketchup.png"),
  lime: require("../../assets/images/food/lime.png"),
  milk: require("../../assets/images/food/milk.png"),
  parmesan: require("../../assets/images/food/parmesan.png"),
  peanutbutter: require("../../assets/images/food/peanutbutter.png"),
  potato: require("../../assets/images/food/potato.png"),
  redbellpepper: require("../../assets/images/food/redbellpepper.png"),
  rigatoni: require("../../assets/images/food/rigatoni.png"),
  salmon: require("../../assets/images/food/salmon.png"),
  shallot: require("../../assets/images/food/shallot.png"),
  shrimp: require("../../assets/images/food/shrimp.png"),
  spaghetti: require("../../assets/images/food/spaghetti.png"),
  tomato: require("../../assets/images/food/tomato.png"),
  tomatopaste: require("../../assets/images/food/tomatopaste.png"),
  wheatbread: require("../../assets/images/food/wheatbread.png"),
  yogurt: require("../../assets/images/food/yogurt.png"),
};

const GENERIC_FOOD_FALLBACK_KEY: FoodKey = "broccoli";

type RecipeUI = GeneratedRecipe & { isFavorite?: boolean; _imgKey?: FoodKey };

/** Normalize display name for the top "Use it or lose it" labels */
function normalizeFoodLabel(raw: string) {
  const s = (raw || "").trim();

  // fix: "Boneless Chicken Breast" -> "Chicken Breast"
  if (/boneless\s+chicken\s+breast/i.test(s)) return "Chicken Breast";

  // keep it simple & consistent (title-case-ish)
  // (We won’t aggressively title-case everything to avoid weird capitalization.)
  return s;
}

/**
 * Convert inventory food_type to a FoodKey (best-effort).
 * This is what powers the top 3 ingredient icons.
 */
function foodTypeToKey(foodType: string): FoodKey | null {
  const t = (foodType || "").toLowerCase();

  // proteins
  if (t.includes("chicken breast") || (t.includes("chicken") && t.includes("breast"))) return "chickenbreast";
  if (t.includes("beef") || t.includes("steak")) return "beefsteak";
  if (t.includes("salmon")) return "salmon";
  if (t.includes("shrimp")) return "shrimp";
  if (t.includes("egg")) return "egg";
  if (t.includes("impossible")) return "impossibleburger";

  // veg / produce
  if (t.includes("green bell pepper") || t.includes("green pepper")) return "greenbellpepper";
  if (t.includes("red bell pepper") || t.includes("red pepper")) return "redbellpepper";
  if (t.includes("bell pepper")) return "greenbellpepper"; // default bell pepper
  if (t.includes("green bean")) return "greenbean";
  if (t.includes("broccoli")) return "broccoli";
  if (t.includes("carrot")) return "carrot";
  if (t.includes("cucumber")) return "cucumber";
  if (t.includes("tomato paste")) return "tomatopaste";
  if (t.includes("tomato")) return "tomato";
  if (t.includes("potato")) return "potato";
  if (t.includes("garlic")) return "garlic";
  if (t.includes("shallot")) return "shallot";
  if (t.includes("jalape")) return "jalapeno";
  if (t.includes("lime")) return "lime";

  // dairy / pantry
  if (t.includes("heavy cream")) return "heavycream";
  if (t.includes("milk")) return "milk";
  if (t.includes("yogurt")) return "yogurt";
  if (t.includes("parmesan")) return "parmesan";
  if (t.includes("butter")) return "butter";
  if (t.includes("peanut butter")) return "peanutbutter";
  if (t.includes("ketchup")) return "ketchup";
  if (t.includes("chicken broth") || t.includes("broth")) return "chickenbroth";
  if (t.includes("wheat bread") || t.includes("bread")) return "wheatbread";

  // pasta
  if (t.includes("spaghetti")) return "spaghetti";
  if (t.includes("rigatoni")) return "rigatoni";

  return null;
}

/**
 * Pick a recipe image key (local stock icon) that matches the recipe.
 * Goal:
 * - strictly food-looking (local icons only)
 * - avoid duplicates across the visible list (by usedKeys)
 */
function pickRecipeImageKey(recipe: GeneratedRecipe, usedKeys: Set<FoodKey>): FoodKey {
  const title = (recipe.title || "").toLowerCase();

  const ingredients = [
    ...(recipe.ingredients_used?.map((x) => x.name) ?? []),
    ...(recipe.ingredients_optional?.map((x) => x.name) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const text = `${title} ${ingredients}`;

  // Ordered priority list (feel free to tweak)
  const candidates: FoodKey[] = [];

  // proteins first
  if (text.includes("chicken")) candidates.push("chickenbreast");
  if (text.includes("beef") || text.includes("steak")) candidates.push("beefsteak");
  if (text.includes("salmon")) candidates.push("salmon");
  if (text.includes("shrimp")) candidates.push("shrimp");
  if (text.includes("egg")) candidates.push("egg");
  if (text.includes("impossible")) candidates.push("impossibleburger");

  // veg / produce
  if (text.includes("green bell pepper") || text.includes("green pepper")) candidates.push("greenbellpepper");
  if (text.includes("red bell pepper") || text.includes("red pepper")) candidates.push("redbellpepper");
  if (text.includes("bell pepper")) candidates.push("greenbellpepper");
  if (text.includes("green bean")) candidates.push("greenbean");
  if (text.includes("broccoli")) candidates.push("broccoli");
  if (text.includes("carrot")) candidates.push("carrot");
  if (text.includes("cucumber")) candidates.push("cucumber");
  if (text.includes("tomato paste")) candidates.push("tomatopaste");
  if (text.includes("tomato")) candidates.push("tomato");
  if (text.includes("potato")) candidates.push("potato");
  if (text.includes("garlic")) candidates.push("garlic");
  if (text.includes("shallot")) candidates.push("shallot");
  if (text.includes("jalape")) candidates.push("jalapeno");
  if (text.includes("lime")) candidates.push("lime");

  // dairy/pantry
  if (text.includes("heavy cream")) candidates.push("heavycream");
  if (text.includes("milk")) candidates.push("milk");
  if (text.includes("yogurt")) candidates.push("yogurt");
  if (text.includes("parmesan")) candidates.push("parmesan");
  if (text.includes("butter")) candidates.push("butter");
  if (text.includes("peanut butter")) candidates.push("peanutbutter");
  if (text.includes("ketchup")) candidates.push("ketchup");
  if (text.includes("chicken broth") || text.includes("broth")) candidates.push("chickenbroth");
  if (text.includes("wheat bread") || text.includes("bread") || text.includes("sandwich")) candidates.push("wheatbread");

  // pasta
  if (text.includes("spaghetti")) candidates.push("spaghetti");
  if (text.includes("rigatoni")) candidates.push("rigatoni");
  if (text.includes("pasta")) candidates.push("spaghetti");

  // Dedup while preserving order
  const seen = new Set<FoodKey>();
  const ordered = candidates.filter((k) => (seen.has(k) ? false : (seen.add(k), true)));

  // Prefer an unused matching key
  for (const k of ordered) {
    if (!usedKeys.has(k)) return k;
  }
  // If all matching keys used, allow reuse (but we’ll try to avoid it below)
  if (ordered.length > 0) return ordered[0];

  // Otherwise pick any unused key to avoid duplicate-looking tiles
  const allKeys = Object.keys(FOOD_IMAGES) as FoodKey[];
  const firstUnused = allKeys.find((k) => !usedKeys.has(k));
  return firstUnused ?? GENERIC_FOOD_FALLBACK_KEY;
}

export default function RecipeScreen() {
  const [inventory, setInventory] = useState<InventoryDict>({});
  const [recipes, setRecipes] = useState<RecipeUI[]>([]);
  const [loading, setLoading] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  // Detail overlay modal state
  const [selected, setSelected] = useState<RecipeUI | null>(null);
  const [detailTab, setDetailTab] = useState<"ingredients" | "directions">("ingredients");

  const latestRunId = useRef(0);

  const useSoon = useMemo(() => {
    const items = Object.values(inventory);
    return items
      .slice()
      .sort((a, b) => (a.date_expiring < b.date_expiring ? -1 : 1))
      .slice(0, 3);
  }, [inventory]);

  const favorites = useMemo(() => recipes.filter((r) => r.isFavorite), [recipes]);

  useEffect(() => {
    seedDemoInventoryFromExpirationDays();
    const unsub = subscribeInventory((inv) => setInventory(inv));
    return unsub;
  }, []);

  useEffect(() => {
    const invCount = Object.keys(inventory).length;
    if (invCount === 0) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    const runId = ++latestRunId.current;

    (async () => {
      setLoading(true);
      try {
        const result = await generateRecipesFromInventory(inventory, { count: 4 });
        if (runId !== latestRunId.current) return;

        // ✅ FIX: stamp each recipe with a LOCAL image key, and avoid duplicates in this batch
        const usedKeys = new Set<FoodKey>();
        const stamped: RecipeUI[] = result.map((r) => {
          const key = pickRecipeImageKey(r, usedKeys);
          usedKeys.add(key);
          return { ...r, _imgKey: key, isFavorite: false };
        });

        setRecipes(stamped);
      } finally {
        if (runId !== latestRunId.current) return;
        setLoading(false);
      }
    })();
  }, [inventory]);

  async function onGenerateMore() {
    setLoading(true);
    try {
      const excludeTitles = recipes.map((r) => r.title);
      const newOnes = await generateRecipesFromInventory(inventory, {
        count: 4,
        excludeTitles,
      });

      // ✅ FIX: avoid reusing the same image across existing + new recipes
      const usedKeys = new Set<FoodKey>(recipes.map((r) => r._imgKey).filter(Boolean) as FoodKey[]);

      const stamped: RecipeUI[] = newOnes.map((r) => {
        const id = `${r.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const key = pickRecipeImageKey(r, usedKeys);
        usedKeys.add(key);
        return { ...r, id, _imgKey: key, isFavorite: false };
      });

      setRecipes((prev) => [...stamped, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(id: string) {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)));
  }

  function openDetail(recipe: RecipeUI) {
    setSelected(recipe);
    setDetailTab("ingredients");
  }

  function closeDetail() {
    setSelected(null);
  }

  const useSoonSlots = useMemo(() => {
    // always show 3 slots (some may be empty)
    return [useSoon[0] ?? null, useSoon[1] ?? null, useSoon[2] ?? null];
  }, [useSoon]);

  return (
    <View style={styles.root}>
      {/* TOP YELLOW PANEL */}
      <View style={styles.topYellow}>
        <View style={styles.useItCard}>
          <Text style={styles.useItTitle}>Use it or lose it!</Text>

          {/* ✅ NEW: 3 aligned groups (icon centered over label) */}
          <View style={styles.useItGroupsRow}>
            {useSoonSlots.map((item, idx) => {
              if (!item) {
                return (
                  <View key={`slot-${idx}`} style={styles.useItGroup}>
                    <View style={styles.circle}>
                      {/* empty slot */}
                    </View>
                    <Text style={styles.useItLabelPlaceholder}> </Text>
                  </View>
                );
              }

              const label = normalizeFoodLabel(item.food_type);
              const key = foodTypeToKey(item.food_type);
              const src = key ? FOOD_IMAGES[key] : FOOD_IMAGES[GENERIC_FOOD_FALLBACK_KEY];

              return (
                <View key={`slot-${idx}`} style={styles.useItGroup}>
                  <View style={styles.circle}>
                    <Image source={src} style={styles.useItIcon} resizeMode="contain" />
                  </View>
                  <Text numberOfLines={2} style={styles.useItLabel}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Keep your “No ingredients yet.” copy */}
          {useSoon.length === 0 ? <Text style={styles.useItSub}>No ingredients yet.</Text> : null}
        </View>
      </View>

      {/* BOTTOM GREEN GRADIENT */}
      <LinearGradient
        colors={["#3D8D15", "#74AF36"]}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 0.57, y: 1 }}
        style={styles.bottomGreen}
      >
        <View style={styles.recipesHeaderRow}>
          <Text style={styles.recipesHeaderText}>Recipes</Text>

          <Pressable onPress={() => { /* open filter modal later */ }}>
            <FilterIcon width={22} height={22} />
          </Pressable>
        </View>

        {loading && recipes.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Generating…</Text>
          </View>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={[
              styles.gridContent,
              {
                paddingBottom: tabBarHeight + 24,
                paddingRight: CONTENT_RIGHT_INSET,
              },
            ]}
            renderItem={({ item }) => (
              <RecipeTile
                recipe={item}
                onPress={() => openDetail(item)}
                onToggleStar={() => toggleFavorite(item.id)}
              />
            )}
            ListFooterComponent={
              <View style={styles.footer}>
                <Pressable style={styles.generateBtn} onPress={onGenerateMore} disabled={loading}>
                  <Text style={styles.generateBtnText}>{loading ? "Generating…" : "Generate"}</Text>
                </Pressable>

                <Text style={styles.favTitle}>Starred Recipes</Text>

                {favorites.length === 0 ? (
                  <Text style={styles.favEmpty}>Star recipes to save them here!</Text>
                ) : (
                  <View style={styles.favGrid}>
                    {chunk2(favorites).map((row, idx) => (
                      <View key={idx} style={styles.favRow}>
                        {row.map((r) => (
                          <RecipeTile
                            key={r.id}
                            recipe={r}
                            onPress={() => openDetail(r)}
                            onToggleStar={() => toggleFavorite(r.id)}
                          />
                        ))}
                        {row.length === 1 ? <View style={{ width: "48%" }} /> : null}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            }
          />
        )}
      </LinearGradient>

      {/* DETAIL OVERLAY MODAL */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={closeDetail}>
        {selected ? (
          <View style={styles.detailRoot}>
            <View style={styles.detailHeader}>
              {/* ✅ FIX: use the same local stock image as the tile (no random remote photos) */}
              <Image
                source={FOOD_IMAGES[selected._imgKey ?? GENERIC_FOOD_FALLBACK_KEY]}
                style={styles.detailImage}
                resizeMode="cover"
              />

              <Pressable style={styles.backBtn} onPress={closeDetail}>
                <Text style={styles.backBtnText}>‹</Text>
              </Pressable>
            </View>

            <View style={styles.detailPanel}>
              <Text style={styles.detailTitle}>{selected.title}</Text>

              <View style={styles.toggleWrap}>
                <Pressable
                  onPress={() => setDetailTab("ingredients")}
                  style={[
                    styles.toggleBtn,
                    detailTab === "ingredients" ? styles.toggleActive : styles.toggleInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      detailTab === "ingredients" ? styles.toggleTextActive : styles.toggleTextInactive,
                    ]}
                  >
                    Ingredients
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setDetailTab("directions")}
                  style={[
                    styles.toggleBtn,
                    detailTab === "directions" ? styles.toggleActive : styles.toggleInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      detailTab === "directions" ? styles.toggleTextActive : styles.toggleTextInactive,
                    ]}
                  >
                    Directions
                  </Text>
                </Pressable>
              </View>

              <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {detailTab === "ingredients" ? (
                  <>
                    {selected.ingredients_used.map((x, idx) => (
                      <Text key={`ing-${idx}`} style={styles.bullet}>
                        • {x.quantity ? `${x.name} — ${x.quantity}` : x.name}
                      </Text>
                    ))}

                    {selected.ingredients_optional?.length ? (
                      <>
                        <Text style={[styles.optionalLabel, { marginTop: 10 }]}>Optional:</Text>
                        {selected.ingredients_optional.map((x, idx) => (
                          <Text key={`opt-${idx}`} style={styles.bullet}>
                            • {x.quantity ? `${x.name} — ${x.quantity}` : x.name}
                          </Text>
                        ))}
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    {selected.steps.map((s, idx) => (
                      <Text key={`step-${idx}`} style={styles.bullet}>
                        • {s}
                      </Text>
                    ))}
                  </>
                )}
              </ScrollView>

              <View style={styles.metaRow}>
                {typeof selected.time_minutes === "number" && (
                  <Text style={styles.meta}>⏱ {selected.time_minutes}m</Text>
                )}
                {selected.difficulty && <Text style={styles.meta}>• {selected.difficulty}</Text>}
              </View>
            </View>
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

function RecipeTile({
  recipe,
  onPress,
  onToggleStar,
}: {
  recipe: RecipeUI;
  onPress: () => void;
  onToggleStar: () => void;
}) {
  const key = recipe._imgKey ?? GENERIC_FOOD_FALLBACK_KEY;
  const src = FOOD_IMAGES[key];

  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <View style={styles.tileImageWrap}>
        {/* DEBUG label (won't affect layout) */}
        <Text style={styles.imgSlotLabel}>IMG SLOT</Text>

        {/* ✅ FIX: local stock image only (no random photos / no remote 404s) */}
        <Image source={src} style={styles.tileImage} resizeMode="cover" />
      </View>

      <View style={styles.tileFooter}>
        <Text numberOfLines={2} style={styles.tileTitle}>
          {recipe.title}
        </Text>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          hitSlop={10}
        >
          <Text style={[styles.star, recipe.isFavorite ? styles.starOn : styles.starOff]}>★</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function chunk2<T>(arr: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.darkGreen },

  topYellow: {
    backgroundColor: COLORS.yellow,
    paddingTop: 80,
    paddingHorizontal: 30,
    paddingBottom: 40,
  },

  useItCard: {
    backgroundColor: COLORS.offWhite,
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  useItTitle: {
    fontSize: 40,
    fontFamily: "Offbit-DotBold",
    fontWeight: "normal",
    letterSpacing: 0.5,
    color: COLORS.darkGreen,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 7,
  },

  // ✅ NEW: 3 groups aligned (icon centered above label)
  useItGroupsRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 4,
    marginBottom: 10,
    gap: 12,
  },
  useItGroup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  circle: {
    width: 70,
    height: 70,
    borderRadius: 26,
    backgroundColor: "#E7E7E7",
    alignItems: "center",
    justifyContent: "center",
  },

  useItIcon: {
    width: 70,
    height: 70,
  },

  useItLabel: {
    marginTop: 20,
    fontSize: 12,
    fontFamily: "Helvetica-Light",
    opacity: 0.9,
    color: COLORS.darkGreen,
    textAlign: "center",
    lineHeight: 14,
    minHeight: 28, // keep row height stable even if 2 lines
  },

  useItLabelPlaceholder: {
    marginTop: 8,
    minHeight: 28,
  },

  useItSub: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: "Helvetica-Light",
    opacity: 0.85,
    color: COLORS.darkGreen,
  },

  bottomGreen: { flex: 1, paddingLeft: 30, paddingRight: 18, paddingTop: 14 },

  recipesHeaderRow: {
    paddingVertical: 13,
    flexDirection: "row",
    paddingHorizontal: 0,
    alignItems: "center",
    paddingRight: CONTENT_RIGHT_INSET,
    justifyContent: "space-between",
    marginBottom: 12,
  },

  recipesHeaderText: {
    fontSize: 40,
    fontFamily: "Offbit-DotBold",
    fontWeight: "normal",
    letterSpacing: 0.5,
    color: COLORS.offWhite,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  loadingWrap: { paddingTop: 30, alignItems: "center" },
  loadingText: {
    marginTop: 10,
    fontFamily: "Helvetica-Light",
    color: COLORS.offWhite,
    opacity: 0.85,
  },

  gridContent: { paddingBottom: 24 },
  gridRow: { justifyContent: "space-between", marginBottom: 14 },

  tile: {
    width: "48%",
    backgroundColor: COLORS.offWhite,
    borderRadius: 18,
    overflow: "hidden",
  },

  tileImageWrap: {
    width: "100%",
    height: 150,
    backgroundColor: "#DDD",
    position: "relative",
    overflow: "hidden",
  },

  tileImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: undefined,
    height: undefined,
  },

  imgSlotLabel: {
    position: "absolute",
    top: 6,
    left: 6,
    zIndex: 5,
    color: "red",
    fontWeight: "800",
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  tileFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: COLORS.offWhite,
  },

  tileTitle: {
    flex: 1,
    marginRight: 8,
    color: COLORS.darkGreen,
    fontFamily: "Offbit-DotBold",
    fontWeight: "normal",
    letterSpacing: 0.5,
  },

  star: { fontSize: 18, fontFamily: "Helvetica-Light" },
  starOff: { color: COLORS.darkGreen, opacity: 0.9 },
  starOn: { color: COLORS.yellow },

  footer: { paddingTop: 8, paddingBottom: 36 },

  generateBtn: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
    width: 200,
    alignSelf: "center",
  },

  generateBtnText: {
    color: COLORS.darkGreen,
    fontFamily: "Offbit-DotBold",
    fontWeight: "normal",
    letterSpacing: 1,
    fontSize: 16,
  },

  favTitle: {
    color: COLORS.offWhite,
    fontSize: 30,
    fontFamily: "Offbit-DotBold",
    fontWeight: "normal",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  favEmpty: {
    color: COLORS.offWhite,
    fontFamily: "Helvetica-Light",
    opacity: 0.8,
    marginBottom: 10,
  },

  favGrid: { gap: 14 },
  favRow: { flexDirection: "row", justifyContent: "space-between" },
  favCell: { width: "48%" },

  detailRoot: { flex: 1, backgroundColor: COLORS.darkGreen },
  detailHeader: { width: "100%", height: 300, backgroundColor: "#222" },
  detailImage: { width: "100%", height: 260 },

  backBtn: {
    position: "absolute",
    top: 54,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  backBtnText: {
    color: "white",
    fontSize: 30,
    fontFamily: "Offbit-DotBold",
    fontWeight: "normal",
    marginTop: -2,
  },

  detailPanel: {
    flex: 1,
    marginTop: -6,
    backgroundColor: COLORS.offWhite,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 40,
  },

  detailTitle: {
    fontSize: 36,
    fontFamily: "Offbit-DotBold",
    fontWeight: "normal",
    letterSpacing: 1,
    color: COLORS.darkGreen,
    marginBottom: 12,
    textAlign: "center",
  },

  toggleWrap: {
    flexDirection: "row",
    backgroundColor: COLORS.lightGreen,
    borderRadius: 999,
    padding: 6,
    marginBottom: 12,
  },
  toggleBtn: { flex: 1, borderRadius: 999, paddingVertical: 10, alignItems: "center" },
  toggleActive: { backgroundColor: COLORS.yellow },
  toggleInactive: { backgroundColor: "transparent" },

  toggleText: {
    fontFamily: "Offbit-DotBold",
    fontWeight: "normal",
    letterSpacing: 0.8,
  },
  toggleTextActive: { color: COLORS.darkGreen },
  toggleTextInactive: { color: COLORS.darkGreen, opacity: 0.85 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  bullet: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Helvetica-Light",
    color: "#1F1F1F",
    marginBottom: 10,
  },

  optionalLabel: {
    fontFamily: "Offbit-DotBold",
    fontWeight: "normal",
    letterSpacing: 0.8,
    fontSize: 14,
    color: "#1F1F1F",
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },

  meta: {
    fontSize: 16,
    fontFamily: "Helvetica-Light",
    opacity: 0.75,
    color: "#1F1F1F",
  },
});