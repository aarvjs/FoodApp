import { Combo, ComboItem, CustomizationGroup, ComboItemVariant, ComboVariantItem, ComboVariantOption } from "@/types";

export interface ComboModel extends Combo {}

export function sanitizeForFirestore<T = any>(obj: any): T {
  if (obj === undefined) {
    return "" as any;
  }
  if (obj === null) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as any;
  }
  return obj;
}

export function validateComboData(data: Partial<Combo>): void {
  if (!data.name || data.name.trim() === "") {
    throw new Error("Combo Validation Error: Combo name is required.");
  }
}

export function normalizeComboData(data: any): Combo {
  const branchIds = Array.isArray(data.branchIds)
    ? data.branchIds.map((b: any) => String(b))
    : data.branchId
    ? [String(data.branchId)]
    : [];

  const isActive = data.isActive ?? data.isAvailable ?? true;

  const normalized: Combo = {
    id: data.id || "",
    name: (data.name || data.title || "").trim(),
    image: data.image || data.imageUrl || data.bannerUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    description: (data.description || "").trim(),
    isAvailable: isActive,
    isActive: isActive,
    restaurantId: data.restaurantId || "",
    branchId: data.branchId || (branchIds[0] || ""),
    branchIds: branchIds,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };

  return sanitizeForFirestore(normalized);
}

export function validateComboItemData(data: Partial<ComboItem>): void {
  if (!data.name || data.name.trim() === "") {
    throw new Error("Combo Item Validation Error: Item name is required.");
  }
  if (!data.comboId || data.comboId.trim() === "") {
    throw new Error("Combo Item Validation Error: comboId is required.");
  }
  if (data.price === undefined || isNaN(Number(data.price)) || Number(data.price) < 0) {
    throw new Error("Combo Item Validation Error: Valid display price is required.");
  }
}

export function normalizeComboItemData(data: any): ComboItem {
  const branchIds = Array.isArray(data.branchIds)
    ? data.branchIds.map((b: any) => String(b))
    : data.branchId
    ? [String(data.branchId)]
    : [];

  const foodType: "Veg" | "Non Veg" = data.foodType === "Non Veg" || data.isVeg === false ? "Non Veg" : "Veg";
  const isVeg = foodType === "Veg";

  const rawGroups = Array.isArray(data.customizationGroups) ? data.customizationGroups : [];
  const normalizedGroups: CustomizationGroup[] = rawGroups.map((g: any, gIdx: number) => ({
    id: g.id || `cg-${Date.now()}-${gIdx}`,
    restaurantId: data.restaurantId || "",
    branchId: data.branchId || (branchIds[0] || ""),
    branchIds: branchIds,
    title: (g.title || g.name || `Group ${gIdx + 1}`).trim(),
    selectionType: g.selectionType === "single" ? "single" : "multi",
    isRequired: Boolean(g.isRequired),
    minSelection: g.minSelection !== undefined ? Number(g.minSelection) : (g.isRequired ? 1 : 0),
    maxSelection: g.maxSelection !== undefined ? Number(g.maxSelection) : (g.selectionType === "single" ? 1 : 5),
    status: g.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    options: Array.isArray(g.options)
      ? g.options.map((opt: any, oIdx: number) => ({
          id: opt.id || `opt-${Date.now()}-${oIdx}`,
          name: (opt.name || "").trim(),
          price: Number(opt.price) || 0,
          isAvailable: opt.isAvailable !== false
        }))
      : []
  }));

  const rawVariants = Array.isArray(data.variants) ? data.variants : [];
  const normalizedVariants: ComboItemVariant[] = rawVariants.map((v: any, vIdx: number) => {
    const rawItems = Array.isArray(v.items) ? v.items : [];
    let normalizedItems: ComboVariantItem[] = rawItems.map((item: any, iIdx: number) => ({
      id: item.id || `vitem-${Date.now()}-${iIdx}`,
      name: (item.name || `Item ${iIdx + 1}`).trim(),
      description: (item.description || "").trim(),
      isActive: item.isActive !== false,
      displayOrder: item.displayOrder !== undefined ? Number(item.displayOrder) : iIdx,
      options: Array.isArray(item.options)
        ? item.options.map((opt: any, oIdx: number) => ({
            id: opt.id || `vopt-${Date.now()}-${oIdx}`,
            name: (opt.name || "").trim(),
            additionalPrice: Number(opt.additionalPrice ?? opt.price) || 0,
            isActive: opt.isActive !== false && opt.isAvailable !== false,
            displayOrder: opt.displayOrder !== undefined ? Number(opt.displayOrder) : oIdx
          }))
        : []
    }));

    const legacyOptions = Array.isArray(v.options)
      ? v.options.map((opt: any, oIdx: number) => ({
          id: opt.id || `vopt-${Date.now()}-${oIdx}`,
          name: (opt.name || "").trim(),
          additionalPrice: Number(opt.additionalPrice ?? opt.price) || 0,
          isActive: opt.isActive !== false && opt.isAvailable !== false,
          displayOrder: opt.displayOrder !== undefined ? Number(opt.displayOrder) : oIdx
        }))
      : [];

    if (normalizedItems.length === 0 && legacyOptions.length > 0) {
      normalizedItems = [
        {
          id: `vitem-default-${v.id || vIdx}`,
          name: "Items & Extras",
          description: "",
          isActive: true,
          displayOrder: 0,
          options: legacyOptions
        }
      ];
    }

    return {
      id: v.id || `var-${Date.now()}-${vIdx}`,
      name: (v.name || `Variant ${vIdx + 1}`).trim(),
      isActive: v.isActive !== false,
      displayOrder: v.displayOrder !== undefined ? Number(v.displayOrder) : vIdx,
      items: normalizedItems,
      options: legacyOptions
    };
  });

  const isVariantEnabled = Boolean(data.isVariantEnabled);

  const normalized: ComboItem = {
    id: data.id || "",
    comboId: (data.comboId || "").trim(),
    restaurantId: (data.restaurantId || "").trim(),
    branchId: data.branchId || (branchIds[0] || ""),
    branchIds: branchIds,
    name: (data.name || data.title || "").trim(),
    image: data.image || data.imageUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    description: (data.description || "").trim(),
    price: Number(data.price) || 0,
    originalPrice: data.originalPrice !== undefined && data.originalPrice !== null && !isNaN(Number(data.originalPrice))
      ? Number(data.originalPrice)
      : undefined,
    foodType: foodType,
    isVeg: isVeg,
    rating: data.rating !== undefined ? Number(data.rating) : 4.2,
    ratingCount: data.ratingCount !== undefined ? Number(data.ratingCount) : 569,
    isCustomisable: data.isCustomisable ?? (normalizedGroups.length > 0 || isVariantEnabled ? true : false),
    customizationGroups: normalizedGroups,
    isVariantEnabled: isVariantEnabled,
    variants: normalizedVariants,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };

  return sanitizeForFirestore(normalized);
}
