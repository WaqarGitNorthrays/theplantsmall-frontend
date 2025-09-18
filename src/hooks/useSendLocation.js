// hooks/useSendLocation.js
import { useEffect } from "react";
import api from "../utils/axiosInstance";
import { fetchAddress } from "../utils/fetchAddress";

export const useSendLocation = (salesmanId) => {
  useEffect(() => {

    const sendLocation = async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Fetch human-readable address
            const address = await fetchAddress(latitude, longitude);
            // Send everything to backend
            const res = await api.post("/plants-mall-shops/api/update-locations/", {
              identifier: salesmanId,
              lat: latitude,
              lng: longitude,
              address, 
            });
          } catch (err) {
            console.error("Error sending location:", err.response || err.message);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    };
    // First send immediately
    sendLocation();
    // Keep sending every 1min
    const interval = setInterval(sendLocation, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [salesmanId]);
};
