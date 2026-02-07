export interface FridgeItem {
    food_type: string;
    quantity: number;
    price: number;
    category: string;
    date_added: string;
    date_expiring: string;
    id: string; // i add in later
    has_icon: boolean; // i add in later
    icon_name: string | null; // i add in later
}

export interface Receipt {
    id: string;
    date: string;
    totalCost: number;
    imageUris: string[];
    itemCount: number;  
}

export type FridgeState = {
  fridgeItems: FridgeItem[];
  receipts: Record<string, Receipt>;
};