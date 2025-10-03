// src/components/shops/ShopsList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Store, Plus, MapPin, Edit, RefreshCcw } from "lucide-react";
import { formatAddress } from "../../utils/formatAddress";

// ✅ Skeleton loader for shops while fetching
const ShopSkeleton = () => (
  <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex items-start space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  </div>
);

const ShopsList = ({ nearbyShops, loading, error, basePath, handleRefreshShops }) => {
  const navigate = useNavigate();

  const handleEditShop = (shop) => {
    navigate(`${basePath}/shops/${shop.id}/edit`);
  };

  return (
    <div className="space-y-4">
      {/* ✅ Header with refresh & create */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Shops</h3>
        <div className="flex items-center space-x-2">
          {/* <button
            onClick={handleRefreshShops}
            className={`p-2 rounded-full ${
              loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } transition-colors`}
            disabled={loading}
            aria-label="Refresh shops"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button> */}

          <button
            onClick={() => navigate(`${basePath}/shops/create`)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            {/* <Plus className="h-4 w-4 mr-1" /> */}
            Register Shop
          </button>
        </div>
      </div>

      {/* ✅ Shops content */}
      <div className="min-h-[300px] relative">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ShopSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-6">{error}</p>
        ) : nearbyShops.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No shops found nearby</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {nearbyShops.map((shop) => (
              // 💅 START OF REFACTORED SHOP CARD 💅
              <div
                key={shop.id}
                className="border border-gray-200 bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col space-y-3" // Modern, stacked card style
                onClick={(e) => {
                  if (e.target.closest("button")) return;
                  navigate(`${basePath}/shops/${shop.id}/order-taking`);
                }}
              >
                {/* 1. Top Section: Image and Primary Details */}
                <div className="flex items-start space-x-4">
                  <img
                    src={shop.shop_image}
                    alt={shop.shop_name}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover flex-shrink-0" // Flexible image size
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-gray-900 leading-tight truncate">
                      {shop.shop_name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Owner: {shop.owner_name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Phone: {shop.owner_phone || "—"}
                    </p>
                  </div>
                </div>

                {/* 2. Middle Section: Address & Distance (Responsive Layout) */}
                <div className="flex items-start justify-between border-t border-gray-100 pt-3">
                  {/* Address: Multi-line, wrapping, and taking most space */}
                  <div className="flex items-start text-sm text-gray-600 flex-1 min-w-0 pr-4">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <p className="leading-snug text-sm text-gray-600 whitespace-normal break-words">
                      {/* Enforces wrapping for long addresses */}
                      {formatAddress(shop.shop_address)}
                    </p>
                  </div>

                  {/* Distance: Right-aligned, prominent, and fixed width */}
                  <div className="text-right flex-shrink-0 min-w-[70px]">
                    <p className="text-xs text-gray-400 leading-none">Distance</p>
                    <p className="font-semibold text-base text-gray-600 mt-0.5">
                      {shop.distance?.toFixed(2)} km
                    </p>
                  </div>
                </div>

                {/* 3. Bottom Section: Date & Edit Action (Cleanly separated row) */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Registered: {new Date(shop.created_at).toLocaleDateString()}
                  </p>
                  
                  {/* Edit Button: Clear, tappable action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditShop(shop);
                    }}
                    className="flex items-center text-sm text-green-600 font-medium px-2 py-1 -mr-2 rounded-lg hover:bg-blue-50 transition-colors"
                    aria-label={`Edit ${shop.shop_name}`}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </button>
                </div>
              </div>
              // 💅 END OF REFACTORED SHOP CARD 💅
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopsList;