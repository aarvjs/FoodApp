export interface GalleryItemModel {
  id: string;
  restaurantId: string;
  branchId: string;
  imageUrl: string;
  title?: string;
  category?: "Interior" | "Kitchen" | "Food" | "Events";
  createdAt: string;
}
