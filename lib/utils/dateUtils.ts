/**
 * Utility functions for safely parsing and formatting timestamps and dates across the admin portal.
 * Handles Firestore Timestamps, serialized objects ({ seconds, nanoseconds }),
 * ISO strings, epoch numbers, and JS Date objects gracefully without "Invalid Date" errors.
 */

export function parseDateValue(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? new Date() : val;
  }
  // Firestore Timestamp instance (.toDate())
  if (typeof val?.toDate === "function") {
    try {
      const d = val.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch {}
  }
  // Firestore Timestamp instance (.toMillis())
  if (typeof val?.toMillis === "function") {
    try {
      const d = new Date(val.toMillis());
      if (!isNaN(d.getTime())) return d;
    } catch {}
  }
  // Serialized Firestore Timestamp object
  if (typeof val === "object" && val !== null) {
    const sec = val.seconds ?? val._seconds;
    if (typeof sec === "number") {
      const nano = val.nanoseconds ?? val._nanoseconds ?? 0;
      return new Date(sec * 1000 + Math.floor(nano / 1000000));
    }
  }
  // Numbers (seconds or milliseconds)
  if (typeof val === "number") {
    if (val > 1e11) return new Date(val);
    if (val > 1e8) return new Date(val * 1000);
  }
  // String representations
  if (typeof val === "string") {
    const trimmed = val.trim();
    const num = Number(trimmed);
    if (!isNaN(num) && num > 1e8) {
      return parseDateValue(num);
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * Format timestamp nicely for tables and activity ledgers (e.g. "12 Oct 2026, 12:19 PM").
 * Guarantees "Invalid Date" will NEVER be rendered.
 */
export function formatDateTime(val: any): string {
  if (!val) return "N/A";
  try {
    const d = parseDateValue(val);
    if (!d || isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "N/A";
  }
}

/**
 * Format date-only representation (e.g. "12 Oct 2026").
 */
export function formatDateOnly(val: any): string {
  if (!val) return "N/A";
  try {
    const d = parseDateValue(val);
    if (!d || isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}
