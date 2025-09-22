// src/components/common/GpsCapture.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapPin, ExternalLink, Loader2, RefreshCcw } from "lucide-react";
import { formatAddress } from "../../utils/formatAddress";

const GpsCapture = ({ onLocationCaptured, initialGps }) => {
  const [gps, setGps] = useState(
    initialGps || {
      status: "pending",
      lat: null,
      lng: null,
      accuracy: null,
      address: null,
    }
  );

  const watchIdRef = useRef(null);
  const isMounted = useRef(false);

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
    // Only update if the new location has better accuracy
    if (gps.status === "ready" && pos.coords.accuracy > gps.accuracy) {
      return;
    }

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
  
  // --- Start watching for location continuously ---
  const startWatching = () => {
    if (!navigator.geolocation) {
      setGps((g) => ({ ...g, status: "error" }));
      return;
    }
    stopWatching();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => updateLocation(pos),
      (err) => {
        console.error("GPS watch error:", err);
        setGps((g) => ({ ...g, status: "error" }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );
  };

  // --- Stop watching ---
  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };
  
  // --- Capture once for a quick fix, then watch if needed ---
  const captureGPS = () => {
    setGps((g) => ({ ...g, status: "capturing" }));
    if (!navigator.geolocation) {
      setGps((g) => ({ ...g, status: "error" }));
      return;
    }
    
    // First, try a quick, one-time capture
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // If a good position is found, use it and stop here
        updateLocation(pos);
        stopWatching(); 
      },
      (err) => {
        console.warn("Quick GPS capture failed, falling back to continuous watching:", err);
        startWatching(); // Fallback to continuous watching on failure
      },
      {
        enableHighAccuracy: false,
        timeout: 10000, // Shorter timeout for a fast fix
        maximumAge: 0,
      }
    );
  };

  // --- Initial capture and cleanup ---
  useEffect(() => {
    isMounted.current = true;
    captureGPS();
    
    return () => {
      isMounted.current = false;
      stopWatching();
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
            {gps.status === "ready" && (
              <>
                {gps.address || "Fetching address…"}
                {gps.accuracy && (
                  <span className="text-[10px] text-green-600 ml-2">
                    ±{gps.accuracy.toFixed(1)}m
                  </span>
                )}
              </>
            )}
            {gps.status === "capturing" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-green-600" />
                Capturing location…
              </>
            )}
            {gps.status === "pending" && "Ready to capture location."}
            {gps.status === "error" &&
              "Unable to capture location — allow location access in your browser."}
          </p>

          {gps.status === "ready" && (
            <a
              href={`http://maps.google.com/maps?q=${gps.lat},${gps.lng}`}
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
              className={`px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
              disabled={gps.status === 'capturing'}
              aria-label="Refresh shops"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 inline ${gps.status === 'capturing' ? 'animate-spin' : ''}`} />
              Refresh GPS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpsCapture;