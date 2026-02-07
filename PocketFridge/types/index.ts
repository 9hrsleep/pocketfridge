export interface FridgeItem {
    food_type: string;
    quantity: number;
    price: number | null;  // ← Changed
    category: string;
    date_added: string;
    date_expiring: string | null;  // ← Changed
    id: string;
    has_icon: boolean;
    icon_name: string | null;
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