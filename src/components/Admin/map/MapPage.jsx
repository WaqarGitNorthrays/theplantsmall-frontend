// src/components/Admin/MapPage.jsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import api from "../../../utils/axiosInstance";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef({}); // store markers by salesman id

  useEffect(() => {
    if (!mapRef.current) return;

    // ✅ Initialize map only once
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([31.5204, 74.3587], 12);

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://osm.org/copyright">OSM</a> contributors',
      }).addTo(mapInstance.current);
    }

    const loadLocations = async () => {
      try {
        const resp = await api.get("/plants-mall-shops/api/staff-locations/");
        const data = resp.data;
        const salesmen = data.results || data;
        const bounds = [];

        salesmen.forEach((salesman) => {
          const lat = parseFloat(salesman.current_lat);
          const lng = parseFloat(salesman.current_lng);

          if (!lat || !lng) return; // skip invalid

          const id = salesman.id;
          const label = salesman.name || salesman.identifier || "Unknown";
          const imgUrl = salesman.image_url || "/static/default-user.png";

          const popupContent = `
            <div style="text-align:center">
              <strong>${label}</strong><br/>
              <img src="${imgUrl}" alt="${label}" style="width:60px;height:60px;border-radius:50%;margin:5px 0"/><br/>
              ${salesman.address || ""}<br/>
              <small>Last seen: ${salesman.last_seen}</small>
            </div>
          `;

          // Update or create marker
          if (markers.current[id]) {
            markers.current[id].setLatLng([lat, lng]);
            markers.current[id].setPopupContent(popupContent);
          } else {
            markers.current[id] = L.marker([lat, lng])
              .addTo(mapInstance.current)
              .bindPopup(popupContent);
          }

          bounds.push([lat, lng]);
        });

        if (bounds.length > 0) {
          mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (err) {
        console.error("Error loading locations:", err);
      }
    };

    // First fetch immediately
    loadLocations();

    // Refresh every 30s
    const interval = setInterval(loadLocations, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 z-0">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Salesmen Live Locations</h3>
      <div ref={mapRef} className="w-full h-[600px] rounded-lg z-0" />
    </div>
  );
};

export default MapPage;
