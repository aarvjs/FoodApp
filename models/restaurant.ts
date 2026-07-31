export interface AddressLocation {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  pincode: string;
}

export interface RestaurantModel {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  logo: string;
  banner: string;
  cuisineType: string[];
  gstNumber: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  deliveryCharges: number;
  minimumOrder: number;
  hasTableService: boolean;
  hasTakeaway: boolean;
  hasDelivery: boolean;
  hasDineIn: boolean;
  status: "ACTIVE" | "INACTIVE";
  totalBranches?: number;
  totalRevenue?: number;
  createdAt: string;
  updatedAt?: string;
}
