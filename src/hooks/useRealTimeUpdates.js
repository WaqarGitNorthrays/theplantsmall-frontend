// hooks/useRealTimeUpdates.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateSalesmanLocation } from "../store/slices/ridersSlice";

export const useRealTimeUpdates = (salesmanId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!salesmanId) return; // 🚫 Skip if no ID provided
    if (!navigator.geolocation) {
      console.error("❌ Geolocation not supported in this browser.");
      return;
    }

    const roundTo6 = (num) => parseFloat(num.toFixed(6));

    const handleSuccess = (pos) => {
      const lat = roundTo6(pos.coords.latitude);
      const lng = roundTo6(pos.coords.longitude);
      const accuracy = roundTo6(pos.coords.accuracy);

      const location = { lat, lng, accuracy };

      // ✅ Save to Redux so other parts of the app can use it
      dispatch(updateSalesmanLocation({ salesmanId, location }));
    };

    const handleError = (err) => {
      console.error("❌ GPS error:", err.message);
    };

    // 🔄 Start watching user’s location
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 5000, // allow cached positions up to 5s old
        timeout: 10000,   // fail if no update within 10s
      }
    );

    // 🧹 Clean up on unmount or salesman change
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [dispatch, salesmanId]);
};
