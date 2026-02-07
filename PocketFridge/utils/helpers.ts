//  Helper Functions

// ════════════════════════════════════════════════════════
// ID GENERATION
// ════════════════════════════════════════════════════════

export function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateReceiptId(date: string): string {
  return `receipt_${date}`;
}


// ════════════════════════════════════════════════════════
// DATE HANDLING
// ════════════════════════════════════════════════════════

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function getDateOnly(timestamp: string): string {
  return timestamp.split('T')[0]; // "2026-02-06T15:30:00Z" → "2026-02-06"
}

// ════════════════════════════════════════════════════════
// ICON MAPPING
// ⚠️ HARDCODED FOR NOW - REPLACE WITH REAL ICON SYSTEM LATER
// ════════════════════════════════════════════════════════

// HARDCODED: List of foods we have icons for
const ICON_MAP: Record<string, string> = {
  // Vegetables
  'tomato': 'tomato',
  'tomatoes': 'tomato',
  'carrot': 'carrot',
  'carrots': 'carrot',
  'lettuce': 'lettuce',
  'broccoli': 'broccoli',
  
  // Fruits
  'apple': 'apple',
  'apples': 'apple',
  'banana': 'banana',
  'bananas': 'banana',
  'orange': 'orange',
  'oranges': 'orange',
  
  // Dairy
  'milk': 'milk',
  'cheese': 'cheese',
  'yogurt': 'yogurt',
  'butter': 'butter',
  
  // Proteins
  'chicken': 'chicken',
  'beef': 'beef',
  'fish': 'fish',
  'eggs': 'eggs',
  
  // Grains
  'bread': 'bread',
  'rice': 'rice',
  'pasta': 'pasta',
  
  // Add more as needed...
};

// HARDCODED: Check if we have an icon for this food
export function checkHasIcon(foodType: string): boolean {
  const normalized = foodType.toLowerCase().trim();
  return normalized in ICON_MAP;
}

// HARDCODED: Get the icon name for this food
export function getIconName(foodType: string): string | null {
  const normalized = foodType.toLowerCase().trim();
  return ICON_MAP[normalized] || null;
}