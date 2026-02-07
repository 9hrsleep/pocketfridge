import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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

type RecipeUI = GeneratedRecipe & { isFavorite?: boolean };

export default function RecipeScreen() {
  const [inventory, setInventory] = useState<InventoryDict>({});
  const [recipes, setRecipes] = useState<RecipeUI[]>([]);
  const [loading, setLoading] = useState(false);

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

        setRecipes(result.map((r) => ({ ...r, isFavorite: false })));
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

      const stamped = newOnes.map((r) => ({
        ...r,
        id: `${r.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        isFavorite: false,
      }));

      setRecipes((prev) => [...stamped, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(id: string) {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  }

  function openDetail(recipe: RecipeUI) {
    setSelected(recipe);
    setDetailTab("ingredients");
  }

  function closeDetail() {
    setSelected(null);
  }

  return (
    <View style={styles.root}>
      {/* TOP YELLOW PANEL */}
      <View style={styles.topYellow}>
        <View style={styles.useItCard}>
          <Text style={styles.useItTitle}>Use it or lose it!</Text>

          <View style={styles.useItPlaceholderRow}>
            <View style={styles.circle} />
            <View style={styles.circle} />
            <View style={styles.circle} />
          </View>

          <Text style={styles.useItSub}>
            {useSoon.length === 0 ? "No ingredients yet." : useSoon.map((x) => x.food_type).join("   ")}
          </Text>
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
          <Text style={styles.filterIcon}>▾</Text>
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
            contentContainerStyle={styles.gridContent}
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
                  <Text style={styles.generateBtnText}>
                    {loading ? "Generating…" : "Generate"}
                  </Text>
                </Pressable>

                <Text style={styles.favTitle}>Starred Recipes</Text>

                {favorites.length === 0 ? (
                  <Text style={styles.favEmpty}>Star recipes to save them here!</Text>
                ) : (
                  <View style={styles.favGrid}>
                    {chunk2(favorites).map((row, idx) => (
                      <View key={idx} style={styles.favRow}>
                        {row.map((r) => (
                          // ✅ IMPORTANT CHANGE:
                          // Remove the outer favCell (which was ALSO width: 48%) so tiles keep their normal size.
                          <RecipeTile
                            key={r.id}
                            recipe={r}
                            onPress={() => openDetail(r)}
                            onToggleStar={() => toggleFavorite(r.id)}
                          />
                        ))}

                        {/* Keep the grid aligned if there's only 1 tile in the row */}
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
              {selected.image_url ? (
                <Image source={{ uri: selected.image_url }} style={styles.detailImage} resizeMode="cover" />
              ) : (
                <View style={styles.detailImageFallback} />
              )}

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
                {typeof selected.time_minutes === "number" ? (
                  <Text style={styles.meta}>⏱ {selected.time_minutes}m</Text>
                ) : null}
                {selected.difficulty ? <Text style={styles.meta}>• {selected.difficulty}</Text> : null}
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
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <View style={styles.tileImageWrap}>
        {recipe.image_url ? (
          <Image source={{ uri: recipe.image_url }} style={styles.tileImage} resizeMode="cover" />
        ) : (
          <View style={styles.tileImageFallback} />
        )}
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
          <Text style={[styles.star, recipe.isFavorite ? styles.starOn : styles.starOff]}>
            ★
          </Text>
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

  useItPlaceholderRow: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 10,
    marginTop: 4,
  },
  circle: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#E7E7E7" },

  useItSub: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: "Helvetica-Light",
    opacity: 0.85,
    color: COLORS.darkGreen,
  },
  bottomGreen: { flex: 1, paddingHorizontal: 30, paddingTop: 14 },

  recipesHeaderRow: {
    paddingVertical: 13,
    flexDirection: "row",
    paddingHorizontal: 0, // ✅ was 13
    alignItems: "center",
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

  filterIcon: {
    fontSize: 22,
    fontFamily: "Helvetica-Light",
    color: COLORS.offWhite,
    opacity: 0.9,
  },

  loadingWrap: { paddingTop: 30, alignItems: "center" },
  loadingText: { marginTop: 10, fontFamily: "Helvetica-Light", color: COLORS.offWhite, opacity: 0.85 },

  gridContent: { paddingBottom: 24 },
  gridRow: { justifyContent: "space-between", marginBottom: 14 },

  tile: {
    width: "48%",
    backgroundColor: COLORS.offWhite,
    borderRadius: 18,
    overflow: "hidden",
  },
  tileImageWrap: { width: "100%", height: 150, backgroundColor: "#DDD" },
  tileImage: { width: "100%", height: "100%" },
  tileImageFallback: { flex: 1, backgroundColor: "#D9D9D9" },

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
    width: 200,          // ✅ new
    alignSelf: "center", // ✅ new
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
    marginTop:10,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    
  },

  favEmpty: { color: COLORS.offWhite, fontFamily: "Helvetica-Light", opacity: 0.8, marginBottom: 10 },

  favGrid: { gap: 14 },

  // ✅ Keep the row as a 2-column layout (same as recipe grid)
  favRow: { flexDirection: "row", justifyContent: "space-between" },
  favCell: { width: "48%" }, // (unused now, but leaving it doesn’t hurt)

  detailRoot: { flex: 1, backgroundColor: COLORS.darkGreen },
  detailHeader: { width: "100%", height: 300, backgroundColor: "#222" },
  detailImage: { width: "100%", height: "100%" },
  detailImageFallback: { flex: 1, backgroundColor: "#444" },

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
    marginTop: -22,
    backgroundColor: COLORS.offWhite,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },

  detailTitle: {
    fontSize: 34,
    fontFamily: "Offbit-DotBold",
    fontWeight: "normal",
    letterSpacing: 1,
    color: COLORS.darkGreen,
    marginBottom: 12,
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

  metaRow: { flexDirection: "row", gap: 10, paddingTop: 10 },
  meta: { fontSize: 14, fontFamily: "Helvetica-Light", opacity: 0.75, color: "#1F1F1F" },
});