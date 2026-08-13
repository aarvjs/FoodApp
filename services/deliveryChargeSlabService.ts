import { DeliveryChargeSlab } from "@/models/deliveryChargeSlab";
import { deliveryChargeSlabRepository } from "@/repositories/deliveryChargeSlabRepository";

export interface SlabValidationResult {
  isValid: boolean;
  error?: string;
}

export const deliveryChargeSlabService = {
  validateSlab(
    data: Partial<DeliveryChargeSlab>,
    existingSlabs: DeliveryChargeSlab[],
    currentSlabId?: string,
    maxConfiguredRadius?: number,
    isMaxRadiusConfigured: boolean = true
  ): SlabValidationResult {
    if (!isMaxRadiusConfigured) {
      return {
        isValid: false,
        error: "Please configure and save the Maximum Delivery Radius for this branch first before adding delivery charge slabs."
      };
    }

    const minDist = data.minDistanceKm !== undefined ? Number(data.minDistanceKm) : NaN;
    const maxDist = data.maxDistanceKm !== undefined ? Number(data.maxDistanceKm) : NaN;
    const charge = data.deliveryCharge !== undefined ? Number(data.deliveryCharge) : NaN;

    if (isNaN(minDist) || minDist < 0) {
      return { isValid: false, error: "Minimum distance must be a valid number greater than or equal to 0." };
    }

    if (isNaN(maxDist) || maxDist <= minDist) {
      return { isValid: false, error: "Maximum distance must be greater than minimum distance." };
    }

    if (isNaN(charge) || charge < 0) {
      return { isValid: false, error: "Delivery charge must be a valid number greater than or equal to 0." };
    }

    if (maxConfiguredRadius !== undefined && maxConfiguredRadius > 0 && maxDist > maxConfiguredRadius) {
      return {
        isValid: false,
        error: `Slab maximum distance (${maxDist} KM) cannot exceed the configured Maximum Delivery Radius (${maxConfiguredRadius} KM).`
      };
    }

    // Range overlap validation against existing slabs
    for (const slab of existingSlabs) {
      // Skip checking against itself when editing
      if (currentSlabId && slab.id === currentSlabId) continue;

      // Skip inactive slabs when checking range collisions
      if (slab.status !== "ACTIVE") continue;

      // Two ranges [minA, maxA] and [minB, maxB] overlap if minA < maxB AND maxA > minB
      if (minDist < slab.maxDistanceKm && maxDist > slab.minDistanceKm) {
        return {
          isValid: false,
          error: `Distance range ${minDist} - ${maxDist} KM overlaps with existing active slab ${slab.minDistanceKm} - ${slab.maxDistanceKm} KM (₹${slab.deliveryCharge}).`
        };
      }
    }

    return { isValid: true };
  },

  async addSlab(
    data: Partial<DeliveryChargeSlab>,
    existingSlabs: DeliveryChargeSlab[],
    maxConfiguredRadius?: number,
    isMaxRadiusConfigured: boolean = true
  ): Promise<DeliveryChargeSlab> {
    const validation = this.validateSlab(data, existingSlabs, undefined, maxConfiguredRadius, isMaxRadiusConfigured);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid slab data");
    }
    return await deliveryChargeSlabRepository.create(data);
  },

  async updateSlab(
    id: string,
    updated: Partial<DeliveryChargeSlab>,
    existingSlabs: DeliveryChargeSlab[],
    maxConfiguredRadius?: number,
    isMaxRadiusConfigured: boolean = true
  ): Promise<void> {
    const targetSlab = existingSlabs.find((s) => s.id === id);
    if (!targetSlab) {
      throw new Error("Slab not found");
    }

    const mergedData: Partial<DeliveryChargeSlab> = {
      ...targetSlab,
      ...updated
    };

    const validation = this.validateSlab(mergedData, existingSlabs, id, maxConfiguredRadius, isMaxRadiusConfigured);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid slab data");
    }

    await deliveryChargeSlabRepository.update(id, updated);
  },


  async deleteSlab(id: string): Promise<void> {
    await deliveryChargeSlabRepository.delete(id);
  },

  async toggleSlabStatus(
    id: string,
    currentStatus: "ACTIVE" | "INACTIVE",
    existingSlabs: DeliveryChargeSlab[],
    maxConfiguredRadius?: number,
    isMaxRadiusConfigured: boolean = true
  ): Promise<void> {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    // If activating, check if it overlaps with any currently active slab or exceeds max radius
    if (newStatus === "ACTIVE") {
      const targetSlab = existingSlabs.find((s) => s.id === id);
      if (targetSlab) {
        const validation = this.validateSlab(
          { ...targetSlab, status: "ACTIVE" },
          existingSlabs,
          id,
          maxConfiguredRadius,
          isMaxRadiusConfigured
        );
        if (!validation.isValid) {
          throw new Error(validation.error || "Cannot enable slab due to validation error.");
        }
      }
    }

    await deliveryChargeSlabRepository.update(id, { status: newStatus });
  }

};
