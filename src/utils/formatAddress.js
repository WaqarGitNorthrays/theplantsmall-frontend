// utils/formatAddress.js

/**
 * Format an address (structured object or plain string) into a shorter version.
 *
 * @param {string|object} address - Either full string or structured object from API.
 * @returns {string} Formatted address.
 */
export const formatAddress = (address) => {
  if (!address) return "Unknown location";

  // ✅ Case 1: Structured object (from reverse geocoding APIs)
  if (typeof address === "object") {
    const parts = [
      address.house_number,
      address.road,
      address.neighbourhood || address.suburb,
      address.city || address.town || address.village,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Unknown location";
  }

  // ✅ Case 2: Plain string (from backend shop data)
  if (typeof address === "string") {
    const parts = address.split(",").map((p) => p.trim());
    return parts.slice(0, 4).join(", ");
  }

  return "Unknown location";
};
