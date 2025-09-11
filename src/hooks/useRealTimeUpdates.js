// hooks/useRealTimeUpdates.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateSalesmanLocation } from "../store/slices/ridersSlice";
import { fetchNearbyShops } from "../store/slices/shopsSlice";

export const useRealTimeUpdates = (salesmanId = "salesman1") => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation not supported");
      return;
    }

    const roundTo6 = (num) => parseFloat(num.toFixed(6));
    // 📍 Start live location tracking
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {

        const lat = roundTo6(pos.coords.latitude);
        const lng = roundTo6(pos.coords.longitude);
        const accuracy = roundTo6(pos.coords.accuracy);
        const location = {
          lat,
          lng,
          accuracy,
        };

        // ✅ Update location in salesmenSlice
        dispatch(updateSalesmanLocation({ salesmanId, location }));

        // ✅ Also fetch nearby shops using this location
        dispatch(fetchNearbyShops(location));
      },
      (err) => {
        console.error("GPS error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [dispatch, salesmanId]);
};
