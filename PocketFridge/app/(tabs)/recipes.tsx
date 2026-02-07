import React, { useEffect, useMemo, useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFridge } from "../../contexts/FridgeContext";
import { GeneratedRecipe, generateRecipesFromFridge } from "../../services/recipesService";

const COLORS = {
  yellow: "#FFCF20",
  darkGreen: "#285B23",
  darkGreen2: "#1B3F18",
  lightGreen: "#B2D459",
  offWhite: "#FEFFDE",
};

const CONTENT_RIGHT_INSET = 12;

// --- LOCAL ICONS (For "Use it or lose it" Ingredients ONLY) ---
// We keep this here because the top bar shows YOUR fridge items, which match these icons.
const FOOD_IMAGES: Record<string, any> = {
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
  default: require("../../assets/images/food/carrot.png"), 
};

// Helper to get local icon for raw ingredients
const getIngredientIcon = (iconName: string | null) => {
  if (iconName && FOOD_IMAGES[iconName]) return FOOD_IMAGES[iconName];
  return FOOD_IMAGES.default;
};

type RecipeUI = GeneratedRecipe & { isFavorite?: boolean };

export default function RecipeScreen() {
  const { fridgeItems } = useFridge();
  const [recipes, setRecipes] = useState<RecipeUI[]>([]);
  const [loading, setLoading] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const [selected, setSelected] = useState<RecipeUI | null>(null);
  const [detailTab, setDetailTab] = useState<"ingredients" | "directions">("ingredients");

  // 1. "Use it or lose it": Get Top 3 expiring items
  const useSoon = useMemo(() => {
    return [...fridgeItems]
      .filter(i => i.date_expiring)
      .sort((a, b) => new Date(a.date_expiring!).getTime() - new Date(b.date_expiring!).getTime())
      .slice(0, 3);
  }, [fridgeItems]);

  const favorites = useMemo(() => recipes.filter((r) => r.isFavorite), [recipes]);

  // 2. Generate Recipes on Load
  useEffect(() => {
    // Only generate if we have food and haven't generated yet
    if (fridgeItems.length > 0 && recipes.length === 0) {
      loadRecipes();
    }
  }, [fridgeItems]);

  async function loadRecipes() {
    setLoading(true);
    const newRecipes = await generateRecipesFromFridge(fridgeItems, 4);
    setRecipes(newRecipes.map(r => ({ ...r, isFavorite: false })));
    setLoading(false);
  }

  async function onGenerateMore() {
    setLoading(true);
    const newRecipes = await generateRecipesFromFridge(fridgeItems, 2);
    setRecipes(prev => [...prev, ...newRecipes.map(r => ({ ...r, isFavorite: false }))]);
    setLoading(false);
  }

  function toggleFavorite(id: string) {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)));
  }

  // Use fixed 3 slots for the top bar
  const useSoonSlots = [useSoon[0] ?? null, useSoon[1] ?? null, useSoon[2] ?? null];

  return (
    <View style={styles.root}>
      {/* TOP YELLOW PANEL */}
      <View style={styles.topYellow}>
        <View style={styles.useItCard}>
          <Text style={styles.useItTitle}>Use it or lose it!</Text>

          <View style={styles.useItGroupsRow}>
            {useSoonSlots.map((item, idx) => {
              // 3. Local Icons for Ingredients
              const src = item ? getIngredientIcon(item.icon_name) : null;
              
              return (
                <View key={`slot-${idx}`} style={styles.useItGroup}>
                  <View style={styles.circle}>
                     {src && <Image source={src} style={styles.useItIcon} resizeMode="contain" />}
                  </View>
                  <Text numberOfLines={2} style={styles.useItLabel}>
                    {item ? item.food_type : " "}
                  </Text>
                </View>
              );
            })}
          </View>

          {useSoon.length === 0 && <Text style={styles.useItSub}>Fridge is looking fresh!</Text>}
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
          <Pressable><FilterIcon width={22} height={22} /></Pressable>
        </View>

        {loading && recipes.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={COLORS.offWhite} />
            <Text style={styles.loadingText}>Thinking up delicious ideas...</Text>
          </View>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={[
              styles.gridContent,
              { paddingBottom: tabBarHeight + 24, paddingRight: CONTENT_RIGHT_INSET },
            ]}
            renderItem={({ item }) => (
              <RecipeTile
                recipe={item}
                onPress={() => { setSelected(item); setDetailTab("ingredients"); }}
                onToggleStar={() => toggleFavorite(item.id)}
              />
            )}
            ListFooterComponent={
              <View style={styles.footer}>
                <Pressable style={styles.generateBtn} onPress={onGenerateMore} disabled={loading}>
                  <Text style={styles.generateBtnText}>{loading ? "Thinking..." : "Generate More"}</Text>
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
                            onPress={() => { setSelected(r); setDetailTab("ingredients"); }}
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

      {/* DETAIL MODAL */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && (
          <View style={styles.detailRoot}>
            <View style={styles.detailHeader}>
              {/* 4. WEB Image for Details */}
              <Image
                source={{ uri: selected.image_url }}
                style={styles.detailImage}
                resizeMode="cover"
              />
              <Pressable style={styles.backBtn} onPress={() => setSelected(null)}>
                <Text style={styles.backBtnText}>‹</Text>
              </Pressable>
            </View>

            <View style={styles.detailPanel}>
              <Text style={styles.detailTitle}>{selected.title}</Text>
              <Text style={{textAlign:'center', marginBottom: 15, color: '#666', fontStyle: 'italic'}}>
                {selected.why_this_recipe}
              </Text>

              <View style={styles.toggleWrap}>
                <Pressable
                  onPress={() => setDetailTab("ingredients")}
                  style={[styles.toggleBtn, detailTab === "ingredients" ? styles.toggleActive : styles.toggleInactive]}
                >
                  <Text style={[styles.toggleText, detailTab === "ingredients" ? styles.toggleTextActive : styles.toggleTextInactive]}>
                    Ingredients
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setDetailTab("directions")}
                  style={[styles.toggleBtn, detailTab === "directions" ? styles.toggleActive : styles.toggleInactive]}
                >
                  <Text style={[styles.toggleText, detailTab === "directions" ? styles.toggleTextActive : styles.toggleTextInactive]}>
                    Directions
                  </Text>
                </Pressable>
              </View>

              <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {detailTab === "ingredients" ? (
                   selected.ingredients_used.map((x, idx) => (
                      <Text key={idx} style={styles.bullet}>• {x.name} {x.quantity ? `(${x.quantity})` : ''}</Text>
                   ))
                ) : (
                   selected.steps.map((s, idx) => (
                      <Text key={idx} style={styles.bullet}>• {s}</Text>
                   ))
                )}
              </ScrollView>
              
              <View style={styles.metaRow}>
                {selected.time_minutes && <Text style={styles.meta}>⏱ {selected.time_minutes}m</Text>}
                {selected.difficulty && <Text style={styles.meta}>• {selected.difficulty}</Text>}
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

// --- SUBCOMPONENTS ---

function RecipeTile({ recipe, onPress, onToggleStar }: { recipe: RecipeUI; onPress: () => void; onToggleStar: () => void; }) {
  // 5. WEB Image for Tiles
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <View style={styles.tileImageWrap}>
        <Image 
          source={{ uri: recipe.image_url }} 
          style={styles.tileImage} 
          resizeMode="cover" 
        />
      </View>
      <View style={styles.tileFooter}>
        <Text numberOfLines={2} style={styles.tileTitle}>{recipe.title}</Text>
        <Pressable onPress={(e) => { e.stopPropagation(); onToggleStar(); }} hitSlop={10}>
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
  topYellow: { backgroundColor: COLORS.yellow, paddingTop: 80, paddingHorizontal: 30, paddingBottom: 40 },
  useItCard: { backgroundColor: COLORS.offWhite, borderRadius: 22, paddingVertical: 20, paddingHorizontal: 16, alignItems: "center" },
  useItTitle: { fontSize: 40, fontFamily: "Offbit-DotBold", color: COLORS.darkGreen, marginBottom: 7, textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  useItGroupsRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 15, // INCREASED (was 4) - pushes icons down
    marginBottom: 5, // DECREASED (was 10) - balances space below
    gap: 12,
  },
  useItGroup: { flex: 1, alignItems: "center", justifyContent: "flex-start" },
  circle: { width: 70, height: 70, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" },
  useItIcon: { width: 90, // CHANGED from 70
    height: 90, // CHANGED from 70
    resizeMode: 'contain'
  },
  useItLabel: {
    marginTop: 12, // REDUCED (was 20) - brings text closer to icons
    fontSize: 15, // INCREASED (was 12)
    fontFamily: "Helvetica-Light",
    opacity: 1.0, // Removed transparency for clearer text
    color: COLORS.darkGreen,
    textAlign: "center",
    lineHeight: 18, // INCREASED (was 14) to match new font size
    minHeight: 36, // Adjusted height for two lines of larger text
  },
  useItSub: { marginTop: 6, fontSize: 13, fontFamily: "Helvetica-Light", opacity: 0.85, color: COLORS.darkGreen },
  bottomGreen: { flex: 1, paddingLeft: 30, paddingRight: 18, paddingTop: 14 },
  recipesHeaderRow: { paddingVertical: 13, flexDirection: "row", alignItems: "center", paddingRight: CONTENT_RIGHT_INSET, justifyContent: "space-between", marginBottom: 12 },
  recipesHeaderText: { fontSize: 40, fontFamily: "Offbit-DotBold", color: COLORS.offWhite, textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  loadingWrap: { paddingTop: 30, alignItems: "center" },
  loadingText: { marginTop: 10, fontFamily: "Helvetica-Light", color: COLORS.offWhite, opacity: 0.85 },
  gridContent: { paddingBottom: 24 },
  gridRow: { justifyContent: "space-between", marginBottom: 14 },
  tile: { width: "48%", backgroundColor: COLORS.offWhite, borderRadius: 18, overflow: "hidden" },
  tileImageWrap: { width: "100%", height: 150, backgroundColor: "#DDD", position: "relative", overflow: "hidden" },
  tileImage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: undefined, height: undefined },
  tileFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 12, backgroundColor: COLORS.offWhite },
  tileTitle: { flex: 1, marginRight: 8, color: COLORS.darkGreen, fontFamily: "Offbit-DotBold" },
  star: { fontSize: 18, fontFamily: "Helvetica-Light" },
  starOff: { color: COLORS.darkGreen, opacity: 0.9 },
  starOn: { color: COLORS.yellow },
  footer: { paddingTop: 8, paddingBottom: 36 },
  generateBtn: { backgroundColor: COLORS.lightGreen, borderRadius: 16, paddingVertical: 14, alignItems: "center", marginTop: 8, marginBottom: 18, width: 200, alignSelf: "center" },
  generateBtnText: { color: COLORS.darkGreen, fontFamily: "Offbit-DotBold", letterSpacing: 1, fontSize: 16 },
  favTitle: { color: COLORS.offWhite, fontSize: 30, fontFamily: "Offbit-DotBold", marginBottom: 10, marginTop: 10, textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  favEmpty: { color: COLORS.offWhite, fontFamily: "Helvetica-Light", opacity: 0.8, marginBottom: 10 },
  favGrid: { gap: 14 },
  favRow: { flexDirection: "row", justifyContent: "space-between" },
  detailRoot: { flex: 1, backgroundColor: COLORS.darkGreen },
  detailHeader: { width: "100%", height: 300, backgroundColor: "#222" },
  detailImage: { width: "100%", height: "100%"},
  backBtn: { position: "absolute", top: 54, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
  backBtnText: { color: "white", fontSize: 30, fontFamily: "Offbit-DotBold", marginTop: -2 },
  detailPanel: { flex: 1, marginTop: -6, backgroundColor: COLORS.offWhite, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 18, paddingVertical: 40 },
  detailTitle: { fontSize: 36, fontFamily: "Offbit-DotBold", color: COLORS.darkGreen, marginBottom: 12, textAlign: "center" },
  toggleWrap: { flexDirection: "row", backgroundColor: COLORS.lightGreen, borderRadius: 999, padding: 6, marginBottom: 12 },
  toggleBtn: { flex: 1, borderRadius: 999, paddingVertical: 10, alignItems: "center" },
  toggleActive: { backgroundColor: COLORS.yellow },
  toggleInactive: { backgroundColor: "transparent" },
  toggleText: { fontFamily: "Offbit-DotBold", letterSpacing: 0.8 },
  toggleTextActive: { color: COLORS.darkGreen },
  toggleTextInactive: { color: COLORS.darkGreen, opacity: 0.85 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  bullet: { fontSize: 14, lineHeight: 22, fontFamily: "Helvetica-Light", color: "#1F1F1F", marginBottom: 10 },
  metaRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4, marginBottom: 14 },
  meta: { fontSize: 16, fontFamily: "Helvetica-Light", opacity: 0.75, color: "#1F1F1F" },
});