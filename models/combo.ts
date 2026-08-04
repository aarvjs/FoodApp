import { Combo } from "@/types";

export interface ComboModel extends Combo {}

export function validateComboData(data: Partial<Combo>): void {
  if (!data.name || data.name.trim() === "") {
    throw new Error("Combo Validation Error: Combo name is required.");
  }
  if (data.price === undefined || data.price < 0) {
    throw new Error("Combo Validation Error: Base price must be a valid non-negative number.");
  }
  if (!data.items || data.items.length === 0) {
    throw new Error("Combo Validation Error: At least one included product must be selected for the combo.");
  }
}
