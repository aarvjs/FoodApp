export interface ProductCustomizationModel {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface MenuItemModel {
  id: string;
  restaurantId: string;
  branchId: string; // STRICT MANDATORY OWNERSHIP
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: number;
  discountPrice?: number;
  offerPrice?: number;
  image: string;
  images?: string[];
  isAvailable: boolean;
  stock: number;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
  isVeg: boolean;
  foodType: "Veg" | "Non Veg" | "Egg";
  bestseller: boolean;
  recommended: boolean;
  featured: boolean;
  spicyLevel?: "Mild" | "Medium" | "Hot" | "Extra Spicy";
  ingredients?: string[];
  customTags?: string[];
  customizations?: ProductCustomizationModel[];
  prepTimeMinutes: number;
  createdBy?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt?: string;
}

export function validateMenuItemData(data: Partial<MenuItemModel>): void {
  if (!data.restaurantId) {
    throw new Error("MenuItem Validation Error: restaurantId is mandatory.");
  }
  if (!data.branchId) {
    throw new Error("MenuItem Validation Error: branchId is mandatory. Menu items must belong to a Branch.");
  }
}
