// app/(tabs)/index.tsx 
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useFridge } from '../../contexts/FridgeContext';
import { LinearGradient } from 'expo-linear-gradient';

import AllIcon from '../../assets/icons/iconmenu.svg';
import VegIcon from '../../assets/icons/vegetable.svg';
import MeatIcon from '../../assets/icons/meat.svg';
import FishIcon from '../../assets/icons/seafood.svg';
import FruitIcon from '../../assets/icons/fruit.svg';
import DairyIcon from '../../assets/icons/dairy.svg';
import MenuIcon from '../../assets/icons/hamburgermenu.svg';

// ------------ CONSTANT DEFS --------------- //

// --- Layout constants (tweak these to taste) ---
const CARD_TOP = 225; // where the white card starts (distance from top)
const FILTER_SIZE = 50; // bubble width/height (must match filterBtn)

const FILTERS = [
  { id: 'all', label: 'All', Icon: AllIcon },
  { id: 'vegetable', label: 'Veg', Icon: VegIcon },
  { id: 'meat', label: 'Meat', Icon: MeatIcon },
  { id: 'seafood', label: 'Sea', Icon: FishIcon },
  { id: 'fruit', label: 'Fruit', Icon: FruitIcon },
  { id: 'dairy', label: 'Dairy', Icon: DairyIcon },
];

// to map the string_icon names from each food's data struct to the image imports
// This way, when we get an "icon_name" from the API, we can easily find the corresponding 
// image to display in the app.
const FOOD_IMAGES: Record<string, any> = {
  beefsteak: require('../../assets/images/food/beefsteak.png'),
  broccoli: require('../../assets/images/food/broccoli.png'),
  butter: require('../../assets/images/food/butter.png'),
  carrot: require('../../assets/images/food/carrot.png'),
  chickenbreast: require('../../assets/images/food/chickenbreast.png'),
  chickenbroth: require('../../assets/images/food/chickenbroth.png'),
  cucumber: require('../../assets/images/food/cucumber.png'),
  egg: require('../../assets/images/food/egg.png'),
  garlic: require('../../assets/images/food/garlic.png'),
  greenbean: require('../../assets/images/food/greenbean.png'),
  greenbellpepper: require('../../assets/images/food/greenbellpepper.png'),
  heavycream: require('../../assets/images/food/heavycream.png'),
  impossibleburger: require('../../assets/images/food/impossibleburger.png'),
  jalapeno: require('../../assets/images/food/jalapeno.png'),
  ketchup: require('../../assets/images/food/ketchup.png'),
  lime: require('../../assets/images/food/lime.png'),
  milk: require('../../assets/images/food/milk.png'),
  parmesan: require('../../assets/images/food/parmesan.png'),
  peanutbutter: require('../../assets/images/food/peanutbutter.png'),
  potato: require('../../assets/images/food/potato.png'),
  redbellpepper: require('../../assets/images/food/redbellpepper.png'),
  rigatoni: require('../../assets/images/food/rigatoni.png'),
  salmon: require('../../assets/images/food/salmon.png'),
  shallot: require('../../assets/images/food/shallot.png'),
  shrimp: require('../../assets/images/food/shrimp.png'),
  spaghetti: require('../../assets/images/food/spaghetti.png'),
  tomato: require('../../assets/images/food/tomato.png'),
  tomatopaste: require('../../assets/images/food/tomatopaste.png'),
  wheatbread: require('../../assets/images/food/wheatbread.png'),
  yogurt: require('../../assets/images/food/yogurt.png'),
  
  // Fallback default
  default: require('../../assets/images/food/carrot.png'), 
};
// DEFINE STRICT ORDER
const CATEGORY_ORDER = ['vegetable', 'fruit', 'grain', 'meat', 'seafood', 'dairy', 'other'];

// HELPER function: Calculate if food should be marked red (expiring soon)
const isExpiringSoon = (dateString: string | null) => {
  if (!dateString) return false;
  const today = new Date();
  const expDate = new Date(dateString);
  
  // Calculate difference in milliseconds
  const diffTime = expDate.getTime() - today.getTime();
  // Convert to days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Return true if expiring in 2 days or less (or already expired)
  return diffDays <= 2;
};

// ------------ MAIN CODE --------------- //
export default function FridgeScreen() {
  const { fridgeItems } = useFridge();
  const [activeFilter, setActiveFilter] = useState('all');

  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};

    fridgeItems.forEach((item) => {
      // Normalize Category:
      // API might return 'carbs', we map it to 'grain'
      let cat = item.category ? item.category.toLowerCase() : 'other';
      if (cat === 'carbs') cat = 'grain';
      if (cat === 'condiment') cat = 'other';
      
      // If category isn't in our strict list, dump it in 'other'
      if (!CATEGORY_ORDER.includes(cat)) cat = 'other';

      // Apply Filter
      if (activeFilter !== 'all' && cat !== activeFilter) return;

      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return groups;
  }, [fridgeItems, activeFilter]);

  // use the table to match each food with an image
  const getFoodImage = (iconName: string | null) => {
    console.log("Getting image for icon name: %s", iconName);
    if (iconName && FOOD_IMAGES[iconName]) {
      return FOOD_IMAGES[iconName];
    }
    return FOOD_IMAGES['default'];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1B7901', '#C3DF63']}
        start={{ x: 1, y: 0.95 }} 
        end={{ x: 0, y: 1 }}
        style={styles.gradientRoot}
      />

      <View style={styles.headerArea}>
        <View style={styles.headerRow}>
          <Text style={styles.pixelTitle}>Your Fridge</Text>
          <TouchableOpacity style={styles.menuBtn}>
            <MenuIcon width={22} height={22} />
          </TouchableOpacity>
        </View>
      </View>
<View style={styles.sheetCard}>
        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
          {fridgeItems.length === 0 ? (
            <Text style={styles.emptyText}>Fridge is empty! 🛒</Text>
          ) : (
            // 3. RENDER BY STRICT ORDER
            CATEGORY_ORDER.map((category) => {
              const items = groupedItems[category];
              // Don't render empty sections
              if (!items || items.length === 0) return null;

              return (
                <View key={category} style={styles.sectionContainer}>
                  {/* Capitalize Title */}
                  <Text style={styles.sectionTitle}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>

                  <View style={styles.gridContainer}>
                    {items.map((item) => {
                      
                      // 🔍 DEBUG: Print Expiry Info to Console
                      if (item.date_expiring) {
                        const today = new Date();
                        const exp = new Date(item.date_expiring);
                        const diff = exp.getTime() - today.getTime();
                        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                        console.log(`[Fridge] ${item.food_type}: Exp ${item.date_expiring} (${days} days left)`);
                      } else {
                        console.log(`[Fridge] ${item.food_type}: No Expiration Date`);
                      }

                      return (
                        <View key={item.id} style={styles.gridItem}>
                          
                          {/* 4. CHECK EXPIRY DATE (<= 2 Days) */}
                          {isExpiringSoon(item.date_expiring) && (
                            <View style={styles.notificationBubble}>
                              <Text style={styles.notifText}>!</Text>
                            </View>
                          )}

                          <View style={styles.imageCard}>
                            {item.icon_name ? (
                              <Image source={getFoodImage(item.icon_name)} style={styles.foodImage} />
                            ) : (
                              <Text style={{ fontSize: 30 }}>📦</Text>
                            )}
                          </View>

                          <Text style={styles.foodLabel}>{item.food_type}</Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.separator} />
                </View>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      <View style={styles.filtersDock}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollDock}
          contentContainerStyle={styles.filterRowContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterBtn, activeFilter === filter.id && styles.filterBtnActive]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <filter.Icon width={22} height={22} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFEEF' },

  gradientRoot: {
    ...StyleSheet.absoluteFillObject,
  },

  // Header lives on the green
  headerArea: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 18,
    margin: 13,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pixelTitle: {
    fontSize: 48,
    fontFamily: 'Offbit-DotBold',
    fontWeight: 'normal',
    color: '#FCFEEF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  menuBtn: {
    backgroundColor: '#FCFEEF',
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  // White card sheet
  sheetCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: CARD_TOP,
    bottom: 0,
    backgroundColor: '#FCFEEF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: 'hidden',
    paddingTop: FILTER_SIZE / 2 + 14, // leaves space so content doesn't sit under the overlapped filters
    paddingHorizontal: 20,
  },

  // Filters docked so icon center aligns with top of sheetCard
  filtersDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: CARD_TOP - FILTER_SIZE / 2, // centers bubbles on the seam
  },

  filterScrollDock: {
    paddingBottom: 12, // creates room so bottom shadow isn’t clipped
    paddingTop: 2,
    overflow: 'visible', // iOS helps
  },

  filterRowContent: {
    paddingHorizontal: 20,
    paddingBottom: 12, // Android often needs this too
  },

  filterBtn: {
    width: FILTER_SIZE,
    height: FILTER_SIZE,
    borderRadius: FILTER_SIZE / 2,
    backgroundColor: '#CEE67A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#B2D459',
  },

  filterBtnActive: {
    backgroundColor: '#F9FF83',

    // iOS shadow
    shadowColor: '#1B7901',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,

    // Android shadow
    elevation: 6,
  },

  // Content inside white card
  mainScroll: { flex: 1 },

  sectionContainer: { marginBottom: 25 },

  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Offbit-DotBold',
    fontWeight: 'normal',
    color: '#285B23',
    marginBottom: 10,
  },

  // ✅ used as divider BETWEEN sections (now at end of each category)
  separator: {
    height: 4,
    backgroundColor: '#CBE585',
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 15,
    width: '100%',
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#65a30d',
    marginTop: 50,
    fontFamily: 'Helvetica-Light',
  },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  gridItem: { width: '31%', marginRight: '2%', marginBottom: 20, alignItems: 'center' },

  imageCard: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },

  foodImage: { width: '70%', height: '70%', resizeMode: 'contain' },

  foodLabel: {
    marginTop: 5,
    color: '#285B23',
    fontSize: 12,
    fontFamily: 'Helvetica-Light',
    textAlign: 'center',
  },

  notificationBubble: {
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 10,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  notifText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});