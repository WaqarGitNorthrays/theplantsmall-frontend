// hooks/useSendLocation.js
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import api from "../utils/axiosInstance";
import { fetchAddress } from "../utils/fetchAddress";

// 🌍 Haversine formula to calculate distance in meters
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 6371e3; // meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in meters
};

export const useSendLocation = (salesmanId) => {
  const location = useSelector(
  (state) => state.salesmen.locations?.[salesmanId]
);

  const lastSentRef = useRef({ lat: null, lng: null, time: 0 });

  useEffect(() => {
    if (!salesmanId || !location) return;

    const sendLocation = async () => {
      const { lat, lng } = location;
      const now = Date.now();

      // 🚫 Skip if coords haven't changed significantly (within 5m) & last sent < 5min ago
      const movedDistance = getDistance(
        lastSentRef.current.lat,
        lastSentRef.current.lng,
        lat,
        lng
      );
      const tooSoon = now - lastSentRef.current.time < 5 * 60 * 1000;

      if (movedDistance < 5 && tooSoon) {
        return; // skip sending
      }

      try {
        const address = await fetchAddress(lat, lng);

        await api.post("/plants-mall-shops/api/update-locations/", {
          identifier: salesmanId,
          lat,
          lng,
          address,
        });

        // ✅ Update last sent reference
        lastSentRef.current = { lat, lng, time: now };
      } catch (err) {
        console.error("Error sending location:", err.response || err.message);
      }
    };

    // Send once immediately
    sendLocation();

    // Keep checking every 1 min
    const interval = setInterval(sendLocation, 60000);
    return () => clearInterval(interval);
  }, [salesmanId, location]);
};
