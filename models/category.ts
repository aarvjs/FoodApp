export interface CategoryModel {
  id: string;
  restaurantId: string;
  branchId: string; // STRICT MANDATORY OWNERSHIP
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  image: string;
  itemCount: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt?: string;
}

export function validateCategoryData(data: Partial<CategoryModel>): void {
  if (!data.restaurantId) {
    throw new Error("Category Validation Error: restaurantId is mandatory.");
  }
  if (!data.branchId) {
    throw new Error("Category Validation Error: branchId is mandatory.");
  }
}
