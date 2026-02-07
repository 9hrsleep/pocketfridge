// Main State Management for fridge
// React imports
import React, { createContext, useContext, useState } from 'react';

// Your type definitions
import { FridgeItem, Receipt, FridgeState } from '../types';

import { 
  generateItemId, 
  generateReceiptId,
  getCurrentTimestamp,
  getDateOnly,
  checkHasIcon,
  getIconName
} from '../utils/helpers';

// Context type definition
type FridgeContextType = FridgeState & {
  addItemsToFridge: (items: any[], receiptImageUri: string) => void;
  updateItemQuantity: (itemId: string, newQuantity: number) => void;
  deleteItem: (itemId: string) => void;
  getTotalSpending: () => number;
};

// ════════════════════════════════════════════════════════
// HARDCODED INITIAL FRIDGE DATA (FOR DEMO)
// ════════════════════════════════════════════════════════

// Helper dates for expiration
const TODAY = new Date();
const TOMORROW = new Date(TODAY); 
TOMORROW.setDate(TODAY.getDate() + 1);
const NEXT_WEEK = new Date(TODAY); 
NEXT_WEEK.setDate(TODAY.getDate() + 7);

const INITIAL_FRIDGE_DATA: FridgeItem[] = [
  // --- 🔴 EXPIRING SOON ---
  {
    id: 'item_milk',
    food_type: '2% Milk',
    quantity: 1,
    category: 'dairy',
    price: 4.50,
    date_added: '2026-02-01',
    date_expiring: getDateOnly(TOMORROW.toISOString()), // Expires tomorrow
    has_icon: true,
    icon_name: 'milk'
  },
  {
    id: 'item_salmon',
    food_type: 'Salmon',
    quantity: 2,
    category: 'meat',
    price: 12.99,
    date_added: '2026-02-02',
    date_expiring: getDateOnly(TODAY.toISOString()), // Expires today!
    has_icon: true,
    icon_name: 'fish'
  },
  {
    id: 'item_broccoli',
    food_type: 'Broccoli',
    quantity: 1,
    category: 'vegetable',
    price: 2.99,
    date_added: '2026-02-01',
    date_expiring: getDateOnly(TOMORROW.toISOString()), // Expires tomorrow
    has_icon: true,
    icon_name: 'broccoli'
  },

  // --- 🟢 FRESH ITEMS ---
  {
    id: 'item_ribeye',
    food_type: 'Ribeye Steak',
    quantity: 2,
    category: 'meat',
    price: 25.00,
    date_added: '2026-02-05',
    date_expiring: getDateOnly(NEXT_WEEK.toISOString()),
    has_icon: true,
    icon_name: 'beefsteak'
  },
  {
    id: 'item_eggs',
    food_type: 'Eggs',
    quantity: 12,
    category: 'dairy',
    price: 5.99,
    date_added: '2026-02-06',
    date_expiring: getDateOnly(NEXT_WEEK.toISOString()),
    has_icon: true,
    icon_name: 'egg'
  },
  {
    id: 'item_potato',
    food_type: 'Potato',
    quantity: 5,
    category: 'vegetable',
    price: 3.99,
    date_added: '2026-02-04',
    date_expiring: getDateOnly(NEXT_WEEK.toISOString()),
    has_icon: true,
    icon_name: 'potato'
  },
  {
    id: 'item_butter',
    food_type: 'Butter',
    quantity: 1,
    category: 'dairy',
    price: 4.99,
    date_added: '2026-01-15',
    date_expiring: null, // Never expires
    has_icon: true,
    icon_name: 'butter'
  },
  {
    id: 'item_pasta',
    food_type: 'Spaghetti',
    quantity: 1,
    category: 'grain',
    price: 1.99,
    date_added: '2026-01-20',
    date_expiring: null, // Never expires
    has_icon: true,
    icon_name: 'spaghetti'
  },
];


const FridgeContext = createContext<FridgeContextType | undefined>(undefined);

// ✅ PROVIDER COMPONENT - WRAPS EVERYTHING
export function FridgeProvider({ children }: { children: React.ReactNode }) {
  // States to be kept track of
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>(INITIAL_FRIDGE_DATA);
  // ↑ Array of item/ingredient objects

  const [receipts, setReceipts] = useState<Record<string, Receipt>>({});
  // ↑ Dictionary: date → receipt object

  // Methods
  const addItemsToFridge = (items: any[], receiptImageUri: string) => {
    // ════════════════════════════════════════════════════════
    // STEP 1: ENRICH ITEMS WITH METADATA
    // ════════════════════════════════════════════════════════
    
    const currentDate = getDateOnly(getCurrentTimestamp()); // "2026-02-06"
    const receiptId = generateReceiptId(currentDate);       // "receipt_2026-02-06"
    
    const enrichedItems: FridgeItem[] = items.map(item => ({
      // Fields from confirmation screen:
      food_type: item.food_type,
      quantity: item.quantity,
      price: item.price,
      category: item.category,
      date_added: item.date_added,
      date_expiring: item.date_expiring,
      
      // Fields YOU add:
      id: generateItemId(),
      has_icon: !!(item.icon_name || checkHasIcon(item.food_type)),
      icon_name: item.icon_name || getIconName(item.food_type)
    }));
    
    
    // ════════════════════════════════════════════════════════
    // STEP 2: MERGE WITH EXISTING FRIDGE
    // ════════════════════════════════════════════════════════
    
    const updatedFridge = [...fridgeItems];
    
    enrichedItems.forEach(newItem => {
      const existingIndex = updatedFridge.findIndex(
        item => item.food_type.toLowerCase() === newItem.food_type.toLowerCase()
      );
      
      if (existingIndex !== -1) {
        // DUPLICATE FOUND: Add quantities and add prices
        const existing = updatedFridge[existingIndex];
        updatedFridge[existingIndex] = {
          ...existing,
          quantity: existing.quantity + newItem.quantity,  // Add quantities
          price: (existing.price || 0) + (newItem.price || 0)  // Add prices (handle nulls)
        };
      } else {
        // NEW ITEM: Add to fridge
        updatedFridge.push(newItem);
      }
    });
    
    
    // ════════════════════════════════════════════════════════
    // STEP 3: CREATE OR UPDATE DAILY RECEIPT
    // ════════════════════════════════════════════════════════
    
    // Calculate total cost of this shopping trip
    const tripCost = enrichedItems.reduce(
      (sum, item) => sum + (item.price || 0),  // Handle null prices
      0
    );
    
    const updatedReceipts = { ...receipts };
    
    if (updatedReceipts[currentDate]) {
      // Receipt for today already exists - UPDATE
      const existing = updatedReceipts[currentDate];
      updatedReceipts[currentDate] = {
        ...existing,
        totalCost: existing.totalCost + tripCost,
        imageUris: [...existing.imageUris, receiptImageUri],
        itemCount: existing.itemCount + enrichedItems.length
      };
    } else {
      // First shopping today - CREATE
      updatedReceipts[currentDate] = {
        id: receiptId,
        date: currentDate,
        totalCost: tripCost,
        imageUris: [receiptImageUri],
        itemCount: enrichedItems.length
      };
    }
    
    
    // ════════════════════════════════════════════════════════
    // STEP 4: UPDATE STATE
    // ════════════════════════════════════════════════════════
    
    setFridgeItems(updatedFridge);
    setReceipts(updatedReceipts);
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    // Update the item with matching ID
    const updated = fridgeItems.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    // Remove items with 0 or negative quantity
    const filtered = updated.filter(item => item.quantity > 0);
    
    setFridgeItems(filtered);
  };

  const deleteItem = (itemId: string) => {
    const filtered = fridgeItems.filter(item => item.id !== itemId);
    setFridgeItems(filtered);
  };

  const getTotalSpending = (): number => {
    return Object.values(receipts).reduce(
      (total, receipt) => total + receipt.totalCost,
      0
    );
  };

  // ✅ RETURN PROVIDER WITH VALUE
  return (
    <FridgeContext.Provider value={{
      fridgeItems,
      receipts,
      addItemsToFridge,
      updateItemQuantity,
      deleteItem,
      getTotalSpending
    }}>
      {children}
    </FridgeContext.Provider>
  );
}

// Export custom hook for easy access
export function useFridge() {
  const context = useContext(FridgeContext);
  if (!context) {
    throw new Error('useFridge must be used within FridgeProvider');
  }
  return context;
}