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
  openingTime: string;
  closingTime: string;
  status: "OPEN" | "CLOSED" | "BUSY";
  location: AddressLocation;
  todayOrdersCount?: number;
  todayRevenue?: number;
  createdAt: string;
  updatedAt?: string;
}
