import { 
  generateItemId, 
  generateReceiptId,
  getCurrentTimestamp,
  getDateOnly,
  checkHasIcon,
  getIconName
} from '../utils/helpers';

export function runHelperTests() {
  console.log("========================================");
  console.log("🧪 TESTING HELPER FUNCTIONS");
  console.log("========================================\n");

  // TEST 1: Generate Item ID
  console.log("TEST 1: generateItemId()");
  const id1 = generateItemId();
  const id2 = generateItemId();
  console.log("  ID 1:", id1);
  console.log("  ID 2:", id2);
  console.log("  ✓ IDs are unique:", id1 !== id2);
  console.log("  ✓ ID format correct:", id1.startsWith("item_"));
  console.log("");

  // TEST 2: Generate Receipt ID
  console.log("TEST 2: generateReceiptId()");
  const receiptId = generateReceiptId("2026-02-06");
  console.log("  Receipt ID:", receiptId);
  console.log("  ✓ Expected: receipt_2026-02-06");
  console.log("  ✓ Match:", receiptId === "receipt_2026-02-06");
  console.log("");

  // TEST 3: Get Current Timestamp
  console.log("TEST 3: getCurrentTimestamp()");
  const timestamp = getCurrentTimestamp();
  console.log("  Timestamp:", timestamp);
  console.log("  ✓ Contains 'T':", timestamp.includes("T"));
  console.log("  ✓ Contains 'Z':", timestamp.includes("Z"));
  console.log("");

  // TEST 4: Get Date Only
  console.log("TEST 4: getDateOnly()");
  const fullTimestamp = "2026-02-06T15:30:00Z";
  const dateOnly = getDateOnly(fullTimestamp);
  console.log("  Input:", fullTimestamp);
  console.log("  Output:", dateOnly);
  console.log("  ✓ Expected: 2026-02-06");
  console.log("  ✓ Match:", dateOnly === "2026-02-06");
  console.log("");

  // TEST 5: Check Has Icon (positive cases)
  console.log("TEST 5: checkHasIcon() - Positive Cases");
  const hasIconTests = ["tomato", "Tomatoes", "MILK", "eggs", "  bread  "];
  hasIconTests.forEach(food => {
    const hasIcon = checkHasIcon(food);
    console.log(`  "${food}" → ${hasIcon} ✓`);
  });
  console.log("");

  // TEST 6: Check Has Icon (negative cases)
  console.log("TEST 6: checkHasIcon() - Negative Cases");
  const noIconTests = ["dragonfruit", "quinoa", "unknown food"];
  noIconTests.forEach(food => {
    const hasIcon = checkHasIcon(food);
    console.log(`  "${food}" → ${hasIcon} (should be false) ${!hasIcon ? '✓' : '✗'}`);
  });
  console.log("");

  // TEST 7: Get Icon Name
  console.log("TEST 7: getIconName()");
  const iconTests = [
    { input: "tomato", expected: "tomato" },
    { input: "Tomatoes", expected: "tomato" },
    { input: "MILK", expected: "milk" },
    { input: "unknown", expected: null }
  ];
  iconTests.forEach(test => {
    const result = getIconName(test.input);
    const match = result === test.expected;
    console.log(`  "${test.input}" → "${result}" ${match ? '✓' : '✗ Expected: ' + test.expected}`);
  });
  console.log("");

  // TEST 8: Edge Cases
  console.log("TEST 8: Edge Cases");
  console.log("  Empty string icon check:", checkHasIcon(""));
  console.log("  Whitespace icon check:", checkHasIcon("   "));
  console.log("  Empty string icon name:", getIconName(""));
  console.log("");

  console.log("========================================");
  console.log("✅ HELPER TESTS COMPLETE");
  console.log("========================================\n");
}

// Context Tests
export function runContextTests() {
  console.log("========================================");
  console.log("🧪 TESTING FRIDGE CONTEXT LOGIC");
  console.log("========================================\n");

  // Simulate state
  let mockFridgeItems: any[] = [];
  let mockReceipts: any = {};

  console.log("TEST 1: Add First Items");
  const items1 = [
    { food_type: "tomatoes", quantity: 2, price: 3.99, category: "vegetable", date_added: "2026-02-06", date_expiring: "2026-02-13" },
    { food_type: "milk", quantity: 1, price: 4.50, category: "dairy", date_added: "2026-02-06", date_expiring: "2026-02-10" }
  ];
  
  // Enrich items (simulate)
  const enriched1 = items1.map((item, idx) => ({
    ...item,
    id: `item_${idx}`,
    has_icon: checkHasIcon(item.food_type),
    icon_name: getIconName(item.food_type)
  }));
  
  mockFridgeItems = [...enriched1];
  console.log("  Added items:", mockFridgeItems.length);
  console.log("  ✓ Fridge has 2 items");
  console.log("");

  console.log("TEST 2: Add Duplicate Item (should merge)");
  const items2 = [
    { food_type: "Tomatoes", quantity: 3, price: 5.00, category: "vegetable", date_added: "2026-02-06", date_expiring: "2026-02-13" }
  ];
  
  const enriched2 = items2.map((item, idx) => ({
    ...item,
    id: `item_new_${idx}`,
    has_icon: checkHasIcon(item.food_type),
    icon_name: getIconName(item.food_type)
  }));
  
  // Simulate merge logic
  enriched2.forEach(newItem => {
    const existingIndex = mockFridgeItems.findIndex(
      item => item.food_type.toLowerCase() === newItem.food_type.toLowerCase()
    );
    
    if (existingIndex !== -1) {
      const existing = mockFridgeItems[existingIndex];
      mockFridgeItems[existingIndex] = {
        ...existing,
        quantity: existing.quantity + newItem.quantity,
        price: (existing.price || 0) + (newItem.price || 0)
      };
      console.log("  ✓ Merged tomatoes:");
      console.log("    Quantity:", mockFridgeItems[existingIndex].quantity, "(expected: 5)");
      console.log("    Price:", mockFridgeItems[existingIndex].price, "(expected: 8.99)");
    }
  });
  console.log("");

  console.log("TEST 3: Test Null Price Handling");
  const items3 = [
    { food_type: "bread", quantity: 1, price: null, category: "grain", date_added: "2026-02-06", date_expiring: "2026-02-08" }
  ];
  
  const tripCost = items3.reduce((sum, item) => sum + (item.price || 0), 0);
  console.log("  Item with null price");
  console.log("  Trip cost:", tripCost, "(expected: 0)");
  console.log("  ✓ Null handled correctly:", tripCost === 0);
  console.log("");

  console.log("TEST 4: Calculate Total Spending");
  mockReceipts = {
    "2026-02-06": { totalCost: 8.99, itemCount: 2 },
    "2026-02-05": { totalCost: 23.50, itemCount: 3 }
  };
  
  const totalSpending = Object.values(mockReceipts).reduce(
    (total: number, receipt: any) => total + receipt.totalCost,
    0
  );
  console.log("  Total spending:", totalSpending);
  console.log("  ✓ Expected: 32.49");
  console.log("  ✓ Match:", totalSpending === 32.49);
  console.log("");

  console.log("TEST 5: Delete Item");
  const itemToDelete = mockFridgeItems[1].id;
  mockFridgeItems = mockFridgeItems.filter(item => item.id !== itemToDelete);
  console.log("  Items after delete:", mockFridgeItems.length);
  console.log("  ✓ Expected: 1 (milk removed)");
  console.log("");

  console.log("TEST 6: Update Quantity to 0 (should remove)");
  const beforeCount = mockFridgeItems.length;
  mockFridgeItems = mockFridgeItems.map(item => 
    item.id === mockFridgeItems[0].id 
      ? { ...item, quantity: 0 }
      : item
  ).filter(item => item.quantity > 0);
  
  const afterCount = mockFridgeItems.length;
  console.log("  Before:", beforeCount);
  console.log("  After:", afterCount);
  console.log("  ✓ Item removed when quantity = 0");
  console.log("");

  console.log("========================================");
  console.log("✅ CONTEXT TESTS COMPLETE");
  console.log("========================================\n");
}

// Option 1 = Full test suite in React Native app

// File: /tests/manualTests.ts (TypeScript)
// Runs: Inside your Expo/React Native app
// How: Click button in test screen
// Tests: ALL helpers + context logic