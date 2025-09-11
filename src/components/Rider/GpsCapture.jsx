// src/components/common/GpsCapture.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapPin, ExternalLink } from "lucide-react";

const GpsCapture = ({ onLocationCaptured }) => {
  const [gps, setGps] = useState({
    status: "not_captured",
    lat: null,
    lng: null,
    accuracy: null,
    address: null,
  });

  const watchIdRef = useRef(null);

  // --- Helper: Reverse geocode ---
  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data.display_name) return data.display_name;
      const addr = data.address || {};
      return (
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.county ||
        "Unknown location"
      );
    } catch (err) {
      console.error("Reverse geocode failed:", err);
      return "Unknown location";
    }
  };

  // --- Update GPS state ---
  const updateLocation = async (pos) => {
    const { latitude, longitude, accuracy } = pos.coords;
    const address = await fetchAddress(latitude, longitude);

    const updatedLocation = {
      status: "ready",
      lat: latitude,
      lng: longitude,
      accuracy,
      address,
    };

    setGps(updatedLocation);
    if (onLocationCaptured) onLocationCaptured(updatedLocation);
  };

  // --- Capture GPS once (fast) ---
  const captureFastGPS = () => {
    if (!navigator.geolocation) {
      setGps((g) => ({ ...g, status: "error" }));
      return;
    }
    setGps((g) => ({ ...g, status: "capturing" }));

    // Quick attempt: 5s timeout
    navigator.geolocation.getCurrentPosition(
      (pos) => updateLocation(pos),
      (err) => {
        console.error("Fast GPS error:", err);
        setGps((g) => ({ ...g, status: "error" }));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
  };

  // --- Watch GPS for real-time updates ---
  const startWatchingGPS = () => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => {
        console.error("GPS watch error:", err);
        setGps((g) => ({ ...g, status: "error" }));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  // --- Auto-capture on mount ---
  useEffect(() => {
    captureFastGPS();
    startWatchingGPS();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // --- Manual capture button ---
  const captureGPS = () => {
    captureFastGPS();
  };

  return (
    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Status + Info */}
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">GPS Location</h3>
          </div>
          <p className="text-xs text-gray-700 mt-2">
            {gps.status === "ready"
              ? gps.address || "Fetching address…"
              : gps.status === "capturing"
              ? "Capturing location…"
              : gps.status === "error"
              ? "Unable to capture location — allow location access in your browser."
              : "Not captured yet."}
          </p>

          {/* Google Maps link */}
          {gps.status === "ready" && (
            <a
              href={`https://www.google.com/maps?q=${gps.lat},${gps.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-xs text-green-700 hover:underline"
            >
              Open in Google Maps <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-start sm:items-end space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={captureGPS}
              className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              Capture GPS
            </button>
          </div>
          {gps.status === "ready" && (
            <p className="text-xs text-gray-600">
              Location is being tracked in real time
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GpsCapture;
