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
// Helper: normalize receipt image URIs so React Native <Image />
// can render them (file:// prefix, etc.)
// ════════════════════════════════════════════════════════
const normalizeUri = (u: string) => {
  if (!u) return u;

  // already valid schemes
  if (u.startsWith("file://") || u.startsWith("http") || u.startsWith("data:")) return u;

  // iOS/Android local absolute paths
  if (u.startsWith("/")) return `file://${u}`;

  return u;
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

// ✅ Get today's date string
const TODAY_STRING = getDateOnly(TODAY.toISOString()); // "2026-02-07"

const INITIAL_FRIDGE_DATA: FridgeItem[] = [
  // --- 🔴 EXPIRING SOON ---
  {
    id: 'item_milk',
    food_type: '2% Milk',
    quantity: 1,
    category: 'dairy',
    price: 4.50,
    date_added: TODAY_STRING,
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
    date_added: TODAY_STRING,
    date_expiring: getDateOnly(TODAY.toISOString()), // Expires today!
    has_icon: true,
    icon_name: 'salmon'
  },
  {
    id: 'item_broccoli',
    food_type: 'Broccoli',
    quantity: 1,
    category: 'vegetable',
    price: 2.99,
    date_added: TODAY_STRING,
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
    date_added: TODAY_STRING,
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
    date_added: TODAY_STRING,
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
    date_added: TODAY_STRING,
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
    date_added: TODAY_STRING,
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
    date_added: TODAY_STRING,
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
    // Normalize receipt image URI for rendering in <Image />
    const normalizedReceiptUri = normalizeUri(receiptImageUri);

    console.log("Saving receipt URI:", receiptImageUri);
    console.log("Normalized receipt URI:", normalizedReceiptUri);

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
      const existingIndex = updatedFridge.findIndex(item => {
        // Must match food name
        const nameMatches = item.food_type.toLowerCase().trim() === newItem.food_type.toLowerCase().trim();
        
        // Must match date added (same shopping day)
        const dateMatches = item.date_added === newItem.date_added;
        
        return nameMatches && dateMatches;  // ✅ Both must match to merge
      });
      
      if (existingIndex !== -1) {
        // DUPLICATE FOUND: Same item, same day - MERGE
        const existing = updatedFridge[existingIndex];
        
        console.log('✅ MERGING:', existing.food_type, existing.quantity, '+', newItem.quantity, '=', existing.quantity + newItem.quantity);
        
        updatedFridge[existingIndex] = {
          ...existing,
          quantity: existing.quantity + newItem.quantity,  // Add quantities
          price: (existing.price || 0) + (newItem.price || 0),  // Add prices
          // Keep the earlier expiration date (more conservative)
          date_expiring: existing.date_expiring && newItem.date_expiring
            ? (new Date(existing.date_expiring) < new Date(newItem.date_expiring) 
                ? existing.date_expiring 
                : newItem.date_expiring)
            : existing.date_expiring || newItem.date_expiring
        };
      } else {
        // NEW ITEM: Different name or different day - ADD
        console.log('➕ ADDING NEW:', newItem.food_type, 'qty:', newItem.quantity, 'date:', newItem.date_added);
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
        receiptImages: [
          ...(existing as any).receiptImages,
          { uri: normalizedReceiptUri, totalCost: tripCost },
        ],
        itemCount: existing.itemCount + enrichedItems.length
      };
    } else {
      // First shopping today - CREATE
      updatedReceipts[currentDate] = {
        id: receiptId,
        date: currentDate,
        totalCost: tripCost,
        receiptImages: [{ uri: normalizedReceiptUri, totalCost: tripCost }],
        itemCount: enrichedItems.length
      };
    }

    console.log("Updated receipts keys:", Object.keys(updatedReceipts));
    console.log("Today receipt:", updatedReceipts[currentDate]);
    
    
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