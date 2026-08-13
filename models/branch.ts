import { AddressLocation } from "./restaurant";

export interface BranchModel {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  phone: string;
  email: string;
  managerName: string;
  managerEmail: string;
  managerId: string;
  deliveryRadiusKm: number;
  maximumDeliveryRadius?: number;
  maxRadiusConfigured?: boolean;
  taxPercentage?: number;
  gstPercentage?: number;
  openingTime: string;


  closingTime: string;
  status: "OPEN" | "CLOSED" | "BUSY";
  location: AddressLocation;
  formattedAddress?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  locationSource?: "gps" | "search";
  todayOrdersCount?: number;
  todayRevenue?: number;
  createdAt: string;
  updatedAt?: string;
}
