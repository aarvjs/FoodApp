export type UserRoleType = "admin" | "branchManager";

export interface UserModel {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  restaurantId?: string;
  branchId?: string;
  assignedBranchId?: string;
  assignedBranchName?: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE";
}
