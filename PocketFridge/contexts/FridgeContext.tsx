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

const FridgeContext = createContext<FridgeContextType | undefined>(undefined);

// ✅ PROVIDER COMPONENT - WRAPS EVERYTHING
export function FridgeProvider({ children }: { children: React.ReactNode }) {
  // States to be kept track of
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
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
      has_icon: checkHasIcon(item.food_type),
      icon_name: getIconName(item.food_type)
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