// PocketFridge/types/index.ts

export interface FridgeItem {
    id: string;
    food_type: string;
    quantity: number;
    price: number | null;
    category: string;
    date_added: string;
    date_expiring: string | null;
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

export interface FridgeState {
    fridgeItems: FridgeItem[];
    receipts: Record<string, Receipt>;
}