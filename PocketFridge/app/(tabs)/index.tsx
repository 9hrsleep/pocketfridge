import React, { useState, useMemo, useRef } from 'react'; // <--- ADD useRef
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useFridge } from '../../contexts/FridgeContext';
import { LinearGradient } from 'expo-linear-gradient';

import AllIcon from '../../assets/icons/iconmenu.svg';
import GrainIcon from '../../assets/icons/grains.svg';
import VegIcon from '../../assets/icons/vegetable.svg';
import MeatIcon from '../../assets/icons/meat.svg';
import FishIcon from '../../assets/icons/seafood.svg';
import FruitIcon from '../../assets/icons/fruit.svg';
import DairyIcon from '../../assets/icons/dairy.svg';
import MenuIcon from '../../assets/icons/hamburgermenu.svg';

// ------------ CONSTANT DEFS --------------- //
const CARD_TOP = 225;
const FILTER_SIZE = 50;

const FILTERS = [
  // { id: 'all', label: 'All', Icon: AllIcon }, // <-- Removed 'All' since we scroll now
  { id: 'vegetable', label: 'Veg', Icon: VegIcon },
  { id: 'fruit', label: 'Fruit', Icon: FruitIcon },
  { id: 'grain', label: 'Grain', Icon: GrainIcon },
  { id: 'meat', label: 'Meat', Icon: MeatIcon },
  { id: 'seafood', label: 'Sea', Icon: FishIcon },
  { id: 'dairy', label: 'Dairy', Icon: DairyIcon },
];

const FOOD_IMAGES: Record<string, any> = {
  banana: require('../../assets/images/food/banana.png'),
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
  default: require('../../assets/images/food/carrot.png'), 
};

const CATEGORY_ORDER = ['vegetable', 'fruit', 'grain', 'meat', 'seafood', 'dairy', 'other'];

const isExpiringSoon = (dateString: string | null) => {
  if (!dateString) return false;
  const today = new Date();
  const expDate = new Date(dateString);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 2;
};

export default function FridgeScreen() {
  const { fridgeItems } = useFridge();
  // ✅ ADD THIS DEBUG LINE
  console.log('🔍 Fridge Items:', fridgeItems.length, fridgeItems);
  
  const [activeFilter, setActiveFilter] = useState<string | null>(null); // <--- Changed default to null

  // REFS for Scrolling
  const scrollRef = useRef<ScrollView>(null);
  const sectionYCoords = useRef<Record<string, number>>({});

  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};

    fridgeItems.forEach((item) => {
      let cat = item.category ? item.category.toLowerCase() : 'other';
      if (cat === 'carbs') cat = 'grain';
      if (cat === 'condiment') cat = 'other';
      if (!CATEGORY_ORDER.includes(cat)) cat = 'other';

      // REMOVED FILTER LOGIC HERE -> We want to show everything!
      
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return groups;
  }, [fridgeItems]); // <--- Removed activeFilter dependency

  const getFoodImage = (iconName: string | null) => {
    if (iconName && FOOD_IMAGES[iconName]) {
      return FOOD_IMAGES[iconName];
    }
    return FOOD_IMAGES['default'];
  };

  // SCROLL LOGIC
  const scrollToCategory = (categoryId: string) => {
    setActiveFilter(categoryId);
    const y = sectionYCoords.current[categoryId];
    
    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: y, animated: true });
    }
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
        <ScrollView 
          ref={scrollRef} // <--- Attach Ref
          style={styles.mainScroll} 
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setActiveFilter(null)} // <--- Untoggle when user drags
          scrollEventThrottle={16}
        >
          {fridgeItems.length === 0 ? (
            <Text style={styles.emptyText}>Fridge is empty! 🛒</Text>
          ) : (
            CATEGORY_ORDER.map((category) => {
              const items = groupedItems[category];
              if (!items || items.length === 0) return null;

              return (
                <View 
                  key={category} 
                  style={styles.sectionContainer}
                  // MEASURE Y POSITION
                  onLayout={(event) => {
                    const layout = event.nativeEvent.layout;
                    sectionYCoords.current[category] = layout.y;
                  }}
                >
                  <Text style={styles.sectionTitle}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>

                  <View style={styles.gridContainer}>
                    {items.map((item) => (
                      <View key={item.id} style={styles.gridItem}>
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
                          {/* ✅ Quantity badge MUST be INSIDE imageCard */}
                          <View style={styles.quantityBadge}>
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                          </View>
                        </View>

                        <Text style={styles.foodLabel}>{item.food_type}</Text>
                      </View>
                    ))}
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
              onPress={() => scrollToCategory(filter.id)} // <--- Call Scroll Function
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
    paddingLeft: 30, // <--- ADD THIS (Increased from 20 to scoot right)
    paddingRight: 20, // Keep right padding for scrolling space
    paddingBottom: 12, 
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

    // ✅ ADD THESE TWO NEW STYLES HERE (before the closing bracket):
  quantityBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#285B23',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityText: {
    color: '#FCFEEF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Light',
  },
});