// utils/fetchAddress.js

// Format raw address object into a human-friendly string
const formatAddress = (addressObj) => {
  const { road, neighbourhood, suburb, city, state, country } = addressObj;

  return [
    road,
    neighbourhood,
    suburb,
    city,
    state,
    country,
  ]
    .filter(Boolean) // remove null/undefined/empty
    .join(", ");
};

// 🔄 Main function to fetch and format address from lat/lng
export const fetchAddress = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await res.json();

    if (data?.address) {
      return formatAddress(data.address);
    }

    return data.display_name || "Unknown location";
  } catch (err) {
    console.error("❌ Reverse geocode failed:", err);
    return "Unknown location";
  }
};
