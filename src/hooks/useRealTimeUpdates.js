// hooks/useRealTimeUpdates.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateSalesmanLocation } from "../store/slices/ridersSlice";
import { fetchNearbyShops } from "../store/slices/shopsSlice";

export const useRealTimeUpdates = (salesmanId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!salesmanId) return; // 🚫 Skip if no ID provided
    if (!navigator.geolocation) {
      console.error("❌ Geolocation not supported");
      return;
    }

    const roundTo6 = (num) => parseFloat(num.toFixed(6));

    const handleSuccess = (pos) => {
      const lat = roundTo6(pos.coords.latitude);
      const lng = roundTo6(pos.coords.longitude);
      const accuracy = roundTo6(pos.coords.accuracy);

      const location = { lat, lng, accuracy };

      dispatch(updateSalesmanLocation({ salesmanId, location }));
      dispatch(fetchNearbyShops(location));
    };

    const handleError = (err) => {
      console.error("GPS error:", err);
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [dispatch, salesmanId]);
};
