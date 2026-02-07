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

// HARDCODED: List of foods we have icons for
const ICON_MAP: Record<string, string> = {
  // Vegetables
  'tomato': 'tomato',
  'tomatoes': 'tomato',
  'carrot': 'carrot',
  'carrots': 'carrot',
  'banana': 'banana',
  'bananas': 'banana',
  'broccoli': 'broccoli',
  'cucumber': 'cucumber',
  'cucumbers': 'cucumber',
  'garlic': 'garlic',
  'green bean': 'greenbean',
  'green beans': 'greenbean',
  'greenbean': 'greenbean',
  'greenbeans': 'greenbean',
  'bell pepper': 'greenbellpepper',
  'green bell pepper': 'greenbellpepper',
  'green pepper': 'greenbellpepper',
  'red bell pepper': 'redbellpepper',
  'red pepper': 'redbellpepper',
  'jalapeno': 'jalapeno',
  'jalapeño': 'jalapeno',
  'jalapenos': 'jalapeno',
  'lime': 'lime',
  'limes': 'lime',
  'potato': 'potato',
  'potatoes': 'potato',
  
  // Fruits
  // (Add if you have fruit icons)
  
  // Dairy
  'milk': 'milk',
  '2% milk': 'milk',
  'whole milk': 'milk',
  'skim milk': 'milk',
  'heavy cream': 'heavycream',
  'cream': 'heavycream',
  'parmesan': 'parmesan',
  'parmesan cheese': 'parmesan',
  'butter': 'butter',
  'yogurt': 'yogurt',
  
  // Proteins
  'beef': 'beefsteak',
  'beefsteak': 'beefsteak',
  'steak': 'beefsteak',
  'ribeye': 'beefsteak',
  'ribeye steak': 'beefsteak',
  'chicken': 'chickenbreast',
  'chicken breast': 'chickenbreast',
  'chicken broth': 'chickenbroth',
  'broth': 'chickenbroth',
  'egg': 'egg',
  'eggs': 'egg',
  'salmon': 'salmon',
  'fish': 'salmon',
  'shrimp': 'shrimp',
  'shrimps': 'shrimp',
  'prawns': 'shrimp',
  'shallot': 'shallot',
  'shallots': 'shallot',
  'impossible burger': 'impossibleburger',
  'veggie burger': 'impossibleburger',
  
  // Grains & Pasta
  'bread': 'wheatbread',
  'wheat bread': 'wheatbread',
  'pasta': 'spaghetti',
  'spaghetti': 'spaghetti',
  'rigatoni': 'rigatoni',
  
  // Condiments & Sauces
  'ketchup': 'ketchup',
  'peanut butter': 'peanutbutter',
  'pb': 'peanutbutter',
  'tomato paste': 'tomatopaste',
  
  // Add more as needed...
};

export function checkHasIcon(foodType: string): boolean {
  const normalized = foodType.toLowerCase().trim();
  return normalized in ICON_MAP;
}

export function getIconName(foodType: string): string | null {
  const normalized = foodType.toLowerCase().trim();
  return ICON_MAP[normalized] || null;
}