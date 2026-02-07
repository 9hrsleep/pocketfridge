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

export default function FridgeScreen() {
  const { fridgeItems } = useFridge();
  const [activeFilter, setActiveFilter] = useState('all');

  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};

    fridgeItems.forEach((item) => {
      const cat = item.category ? item.category : 'Other';
      if (activeFilter !== 'all' && cat.toLowerCase() !== activeFilter.toLowerCase()) return;

      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return groups;
  }, [fridgeItems, activeFilter]);

  const getFoodImage = (iconName: string | null) => {
    switch (iconName) {
      case 'tomato':
        return require('../../assets/images/food/carrot.png');
      case 'carrot':
        return require('../../assets/images/food/carrot.png');
      case 'potato':
        return require('../../assets/images/food/carrot.png');
      case 'chicken':
        return require('../../assets/images/food/carrot.png');
      default:
        return require('../../assets/images/food/carrot.png');
    }
  };

  return (
    <View style={styles.container}>
      {/* GREEN GRADIENT BACKGROUND */}
      <LinearGradient
        colors={['#1B7901', '#C3DF63']}
        start={{ x: 1, y: 0.95 }} // approx -64°
        end={{ x: 0, y: 1 }}
        style={styles.gradientRoot}
      />

      {/* HEADER ON GREEN */}
      <View style={styles.headerArea}>
        <View style={styles.headerRow}>
          <Text style={styles.pixelTitle}>Your Fridge</Text>
          <TouchableOpacity style={styles.menuBtn}>
            <MenuIcon width={22} height={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* WHITE CARD (starts at CARD_TOP and goes to bottom) */}
      <View style={styles.sheetCard}>
        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
          {Object.keys(groupedItems).length === 0 ? (
            <Text style={styles.emptyText}>Fridge is empty! 🛒</Text>
          ) : (
            Object.keys(groupedItems).map((category) => (
              <View key={category} style={styles.sectionContainer}>
                {/* SECTION TITLE */}
                <Text style={styles.sectionTitle}>{category}</Text>

                {/* INGREDIENTS */}
                <View style={styles.gridContainer}>
                  {groupedItems[category].map((item) => (
                    <View key={item.id} style={styles.gridItem}>
                      {item.date_expiring && (
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
                  ))}
                </View>

                {/* ✅ SEPARATOR AT END OF SECTION (not under the title) */}
                <View style={styles.separator} />
              </View>
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* FILTER BAR DOCKED ON THE SEAM */}
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