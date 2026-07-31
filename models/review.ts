export interface ReviewModel {
  id: string;
  restaurantId: string;
  branchId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  orderId?: string;
  createdAt: string;
}
