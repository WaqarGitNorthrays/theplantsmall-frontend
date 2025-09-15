// src/components/common/GpsCapture.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import { formatAddress } from "../../utils/formatAddress";

const GpsCapture = ({ onLocationCaptured }) => {
  const [gps, setGps] = useState({
    status: "not_captured",
    lat: null,
    lng: null,
    accuracy: null,
    address: null,
  });

  const watchIdRef = useRef(null);
  const timeoutRef = useRef(null);
  const retryRef = useRef(false); // ✅ track if we already retried

  // --- Reverse geocode ---
  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data.address) {
        return formatAddress(data.address);
      }
      return data.display_name || "Unknown location";
    } catch (err) {
      console.error("Reverse geocode failed:", err);
      return "Unknown location";
    }
  };

  // --- Update GPS state ---
  const updateLocation = async (pos) => {
    clearTimeout(timeoutRef.current);
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

  // --- Start watching continuously ---
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

  // --- Stop watching ---
  const stopWatchingGPS = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // --- Capture once, with timeout + retry ---
  const captureFastGPS = () => {
    if (!navigator.geolocation) {
      setGps((g) => ({ ...g, status: "error" }));
      return;
    }

    setGps((g) => ({ ...g, status: "capturing" }));

    timeoutRef.current = setTimeout(() => {
      console.warn("GPS timeout — no response within 10s");
      stopWatchingGPS();

      if (!retryRef.current) {
        retryRef.current = true;
        console.log("Retrying GPS once after timeout...");
        captureFastGPS();
        startWatchingGPS();
      } else {
        setGps((g) => ({ ...g, status: "timeout" }));
      }
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (pos) => updateLocation(pos),
      (err) => {
        console.error("Fast GPS error:", err);
        startWatchingGPS();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
  };

  // --- Manual capture button ---
  const captureGPS = () => {
    stopWatchingGPS();
    retryRef.current = false;
    captureFastGPS();
    startWatchingGPS();
  };

  // --- Auto-capture on mount ---
  useEffect(() => {
    captureGPS();

    return () => {
      stopWatchingGPS();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Status + Info */}
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">GPS Location</h3>
          </div>
          <p className="text-xs text-gray-700 mt-2 flex items-center gap-2">
            {gps.status === "ready" && (gps.address || "Fetching address…")}
            {gps.status === "capturing" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-green-600" />
                Capturing location…
              </>
            )}
            {gps.status === "timeout" && "GPS timeout — try again."}
            {gps.status === "error" &&
              "Unable to capture location — allow location access in your browser."}
            {gps.status === "not_captured" && "Not captured yet."}
          </p>

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
