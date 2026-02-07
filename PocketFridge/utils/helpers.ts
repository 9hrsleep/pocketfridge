//  Helper Functions

/* ID Generation Helpers */

// Create a function called generateItemId that creates unique item ids
// should return a string in the format of item_ followed by a random number between 1 and 1000000
export const generateItemId = (): string => {
  const randomNum = Math.floor(Math.random() * 1000000) + 1;
  return `item_${randomNum}`;
};

// Create a function generateReceiptID(date) with these requirements:
//  - Purpose: Create receipt ID from date - Returns: "receipt_year-month-day"
export const generateReceiptID = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `receipt_${year}-${month}-${day}`;
};

/* Data Handling Helpers */

// Create a function getCurrentTimestamp
// return in this format: "YYYY-MM-DD HH:MM:SS"
export const getCurrentTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Create a function getDateOnly(timestamp)
// extracts just the date: "YYYY-MM-DD"
export const getDateOnly = (timestamp: string): string => {
  return timestamp.split(' ')[0]; // Split by space and return the date part
};

/* Icon Mapping Helpers */

// Create a function checkHasIcon(itemName)
// checks if we have icon for that item, returns bool, assume we have a list of available icons in an array called availableIcons
const availableIcons = ['milk', 'eggs', 'cheese', 'bread']; // Example list of available icons

export const checkHasIcon = (itemName: string): boolean => {
  return availableIcons.includes(itemName.toLowerCase());
};

// Create a function getIconName(itemName)
// return icon filename, ex. return "tomato" or "null"
export const getIconName = (itemName: string): string | null => {
  if (checkHasIcon(itemName)) {
    return itemName.toLowerCase(); // Assuming the icon filename is the same as the item name in lowercase
  }
  return null; // Return null if no icon is available
};

