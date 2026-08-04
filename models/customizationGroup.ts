import { CustomizationGroup } from "@/types";

export interface CustomizationGroupModel extends CustomizationGroup {}

export function validateCustomizationGroupData(data: Partial<CustomizationGroup>): void {
  if (!data.title || data.title.trim() === "") {
    throw new Error("CustomizationGroup Validation Error: Title is required.");
  }
  if (!data.options || data.options.length === 0) {
    throw new Error("CustomizationGroup Validation Error: At least one option is required.");
  }
}
