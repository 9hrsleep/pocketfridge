import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useFridge } from '../../contexts/FridgeContext'; 
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; 

// CATEGORY FILTERS (Static list based on your design)
const FILTERS = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'vegetable', label: 'Veg', icon: 'nutrition-outline' },
  { id: 'meat', label: 'Meat', icon: 'restaurant-outline' },
  { id: 'seafood', label: 'Sea', icon: 'fish-outline' },
  { id: 'fruit', label: 'Fruit', icon: 'leaf-outline' },
  { id: 'dairy', label: 'Dairy', icon: 'water-outline' },
];

export default function FridgeScreen() {
  const { fridgeItems } = useFridge();
  const [activeFilter, setActiveFilter] = useState('all');

  // 1. GROUP ITEMS BY CATEGORY
  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    fridgeItems.forEach(item => {
      // Normalize category (default to 'Other' if missing)
      const cat = item.category ? item.category : 'Other';
      
      // Filter logic
      if (activeFilter !== 'all' && cat.toLowerCase() !== activeFilter.toLowerCase()) return;

      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return groups;
  }, [fridgeItems, activeFilter]);

  // 2. HELPER TO GET IMAGE (You will need to add your real images to assets/images/food/)
  const getFoodImage = (iconName: string | null) => {
    // This is a placeholder mapper. Ideally, use a switch statement or object map.
    switch (iconName) {
      case 'tomato': return require('../../assets/images/food/carrot.png'); // Make sure these exist!
      case 'carrot': return require('../../assets/images/food/carrot.png');
      case 'potato': return require('../../assets/images/food/carrot.png');
      case 'chicken': return require('../../assets/images/food/carrot.png');
      default: return require('../../assets/images/food/carrot.png'); // Fallback image
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER GRADIENT */}
      <LinearGradient colors={['#93C247', '#fff']} style={styles.headerBackground} />
      
      <View style={styles.contentContainer}>
        
        {/* HEADER TITLE */}
        <View style={styles.headerRow}>
          <Text style={styles.pixelTitle}>Your Fridge</Text>
          <TouchableOpacity style={styles.menuBtn}>
             <Ionicons name="menu" size={24} color="#285B23" />
          </TouchableOpacity>
        </View>

        {/* FILTER BAR */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map((filter) => (
            <TouchableOpacity 
              key={filter.id} 
              style={[styles.filterBtn, activeFilter === filter.id && styles.filterBtnActive]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={20} 
                color={activeFilter === filter.id ? '#285B23' : '#666'} 
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* MAIN SCROLLABLE CONTENT */}
        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
          {Object.keys(groupedItems).length === 0 ? (
            <Text style={styles.emptyText}>Fridge is empty! 🛒</Text>
          ) : (
            Object.keys(groupedItems).map((category) => (
              <View key={category} style={styles.sectionContainer}>
                {/* Section Title */}
                <Text style={styles.sectionTitle}>{category}</Text>
                
                {/* Green Line Separator */}
                <View style={styles.separator} />

                {/* Grid of Items */}
                <View style={styles.gridContainer}>
                  {groupedItems[category].map((item) => (
                    <View key={item.id} style={styles.gridItem}>
                      
                      {/* Notification Bubble (Red 'K' from design) */}
                      {item.date_expiring && (
                         <View style={styles.notificationBubble}>
                           <Text style={styles.notifText}>!</Text>
                         </View>
                      )}

                      <View style={styles.imageCard}>
                        {/* Use Arielle's icon_name logic */}
                        {item.icon_name ? (
                           <Image 
                             source={getFoodImage(item.icon_name)} 
                             style={styles.foodImage} 
                           />
                        ) : (
                           <Text style={{fontSize: 30}}>📦</Text>
                        )}
                      </View>
                      <Text style={styles.foodLabel}>{item.food_type}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
          <View style={{height: 100}} /> 
        </ScrollView>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFEEF' },
  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 150 },
  contentContainer: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pixelTitle: { fontSize: 32, fontWeight: 'bold', color: '#FCFEEF', fontFamily: 'System', textShadowColor: 'rgba(0,0,0,0.2)', textShadowRadius: 4 },
  menuBtn: { backgroundColor: '#FCFEEF', padding: 10, borderRadius: 20 },

  // Filters
  filterScroll: { maxHeight: 60, marginBottom: 10 },
  filterBtn: { 
    width: 50, height: 50, borderRadius: 25, 
    backgroundColor: '#EDF5D3', justifyContent: 'center', alignItems: 'center', 
    marginRight: 15, borderWidth: 1, borderColor: '#B2D459' 
  },
  filterBtnActive: { backgroundColor: '#F9FF83', borderColor: '#285B23', borderWidth: 2 },

  // Sections
  mainScroll: { flex: 1 },
  sectionContainer: { marginBottom: 25 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#285B23', marginBottom: 5 },
  separator: { height: 4, backgroundColor: '#CBE585', borderRadius: 2, marginBottom: 15, width: '100%' },
  
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#65a30d', // Greenish-gray to match theme
    marginTop: 50,
    fontWeight: '600',
  },

  // Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  gridItem: { width: '31%', marginRight: '2%', marginBottom: 20, alignItems: 'center' }, // 3 columns
  
  imageCard: {
    width: '100%', aspectRatio: 1, backgroundColor: '#fff', 
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    borderWidth: 1, borderColor: '#eee'
  },
  foodImage: { width: '70%', height: '70%', resizeMode: 'contain' },
  foodLabel: { marginTop: 5, color: '#285B23', fontSize: 12, fontWeight: '600', textAlign: 'center' },

  // Notification Bubble
  notificationBubble: {
    position: 'absolute', top: -5, right: -5, zIndex: 10,
    backgroundColor: '#ef4444', width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff'
  },
  notifText: { color: 'white', fontWeight: 'bold', fontSize: 12 }
});