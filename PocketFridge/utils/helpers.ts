// PocketFridge/utils/helpers.ts

// ID GENERATION
export function generateItemId(): string {
  // Creates a unique ID like "item_1707203_xyz"
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateReceiptId(date: string): string {
  return `receipt_${date}`;
}

//  DATE HANDLING
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function getDateOnly(timestamp: string): string {
  return timestamp.split('T')[0]; // "2026-02-06T15:30:00Z" -> "2026-02-06"
}

//  ICON MAPPING
const ICON_MAP: Record<string, string> = {
  'tomato': 'tomato', 'tomatoes': 'tomato', // map these names to icon image file paths (ex. "tomato.png")
  'carrot': 'carrot', 'carrots': 'carrot', 
  'lettuce': 'lettuce', 'broccoli': 'broccoli',
  'apple': 'apple', 'apples': 'apple',
  'banana': 'banana', 'bananas': 'banana',
  'orange': 'orange', 'oranges': 'orange',
  'milk': 'milk', 'cheese': 'cheese',
  'chicken': 'chicken', 'beef': 'beef', 'eggs': 'eggs',
  'bread': 'bread', 'rice': 'rice', 'pasta': 'pasta',
};

export function checkHasIcon(foodType: string): boolean {
  const normalized = foodType.toLowerCase().trim();
  return normalized in ICON_MAP;
}

export function getIconName(foodType: string): string | null {
  const normalized = foodType.toLowerCase().trim();
  return ICON_MAP[normalized] || null;
}