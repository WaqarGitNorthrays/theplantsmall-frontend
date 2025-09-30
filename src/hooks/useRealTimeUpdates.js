// hooks/useRealTimeUpdates.js
import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateSalesmanLocation } from "../store/slices/salesmanSlice";
import { throttle } from "lodash";

export const useRealTimeUpdates = (salesmanId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!salesmanId) return; // 🚫 Skip if no ID
    if (!navigator.geolocation) {
      console.error("Geolocation not supported in this browser.");
      return;
    }

    const roundTo6 = (num) => parseFloat(num.toFixed(6));

    // ✅ Throttle updates: max once every 5s
    const handleSuccess = throttle((pos) => {
      const lat = roundTo6(pos.coords.latitude);
      const lng = roundTo6(pos.coords.longitude);
      const accuracy = roundTo6(pos.coords.accuracy);

      // 🚫 Ignore very inaccurate readings (>100m)
      if (accuracy > 100) return;

      dispatch(updateSalesmanLocation({ salesmanId, location: { lat, lng, accuracy } }));
    }, 5000);

    const handleError = (err) => {
      console.error("GPS error:", err.message);
    };

    // 🔄 Start watching location
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });

    // 🧹 Cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      handleSuccess.cancel?.(); // cancel throttled calls
    };
  }, [dispatch, salesmanId]);
};
