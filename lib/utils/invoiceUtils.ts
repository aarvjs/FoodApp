import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

/**
 * Returns existing invoiceNumber or generates a deterministic invoice number
 * and persists it to Firestore `orders/{orderId}` doc.
 */
export const getOrGenerateInvoiceNumber = (order: any): string => {
  if (!order) return "INV-00000000-000000";

  // 1. Return saved invoice number if present
  if (order.invoiceNumber && String(order.invoiceNumber).trim().length > 0) {
    return String(order.invoiceNumber);
  }
  if (order.billNumber && String(order.billNumber).trim().length > 0) {
    return String(order.billNumber);
  }

  // 2. Generate persistent invoice number: INV-YYYYMMDD-XXXXXX
  const createdDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStr = !isNaN(createdDate.getTime())
    ? createdDate.toISOString().slice(0, 10).replace(/-/g, "")
    : new Date().toISOString().slice(0, 10).replace(/-/g, "");

  let rawSeq = (order.orderNumber || order.id || "").toString().replace(/[^a-zA-Z0-9]/g, "");
  if (rawSeq.length > 6) {
    rawSeq = rawSeq.slice(-6).toUpperCase();
  } else {
    rawSeq = rawSeq.padStart(6, "0").toUpperCase();
  }

  const generatedInvoiceNumber = `INV-${dateStr}-${rawSeq}`;

  // 3. Persist to Firestore asynchronously (fire-and-forget)
  if (order.id && db) {
    try {
      const orderRef = doc(db, "orders", order.id);
      updateDoc(orderRef, {
        invoiceNumber: generatedInvoiceNumber,
        billNumber: generatedInvoiceNumber,
      }).catch((err) => {
        console.warn("Could not save invoiceNumber to Firestore doc:", err);
      });
    } catch (_) {}
  }

  return generatedInvoiceNumber;
};

/**
 * Format currency string in Indian Rupees (₹)
 */
export const formatInvoiceCurrency = (amount: number | string | undefined | null): string => {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return "₹0.00";
  return `₹${num.toFixed(2)}`;
};

/**
 * Format date string (e.g., "24 Aug 2026")
 */
export const formatInvoiceDate = (dateString?: string | number | Date): string => {
  if (!dateString) return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/**
 * Format time string (e.g., "08:42 PM")
 */
export const formatInvoiceTime = (dateString?: string | number | Date): string => {
  if (!dateString) return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

/**
 * Format date & time together (e.g., "24 Aug 2026, 08:42 PM")
 */
export const formatInvoiceDateTime = (dateString?: string | number | Date): string => {
  return `${formatInvoiceDate(dateString)}, ${formatInvoiceTime(dateString)}`;
};
