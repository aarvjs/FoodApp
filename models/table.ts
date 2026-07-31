export interface TableModel {
  id: string;
  restaurantId: string;
  branchId: string;
  tableNumber: string;
  capacity: number;
  section: string;
  type: "Indoor" | "Outdoor" | "Rooftop" | "VIP Room";
  environment: "AC" | "Non AC" | "Open Air";
  status: "AVAILABLE" | "BOOKED" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TableBookingModel {
  id: string;
  restaurantId: string;
  branchId: string;
  tableId: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  guests: number;
  status: "PENDING" | "ACCEPTED" | "CONFIRMED" | "REJECTED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  createdAt: string;
  updatedAt?: string;
}
