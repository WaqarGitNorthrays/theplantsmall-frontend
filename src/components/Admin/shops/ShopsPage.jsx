import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllShops, fetchShopById } from "../../../store/slices/shopsSlice";
import { Store, MapPin, Edit, RefreshCcw, Eye } from "lucide-react";
import ShopDetailsPage from "./ShopDetailsPage";
import { formatAddress } from "../../../utils/formatAddress";
import { useNavigate } from "react-router-dom";

const ShopsPage = () => {
  const dispatch = useDispatch();
  const { shops, loading, error, totalCount, next, previous, selectedShop, loading: shopLoading } = useSelector(
    (state) => state.shops
  );

  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Fetch paginated shops
  useEffect(() => {
    dispatch(fetchAllShops(page));
  }, [dispatch, page]);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          All Shops <span className="text-sm font-medium text-gray-500">({totalCount})</span>
        </h2>
        <button
          onClick={() => dispatch(fetchAllShops(page))}
          className="mt-2 md:mt-0 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </button>
      </div>

      {/* Content */}
      <div className="bg-white p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCcw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-6">{error}</p>
        ) : shops.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No shops found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white flex flex-col"
              >
                {/* Image */}
                {shop.shop_image || shop.images?.length > 0 ? (
                  <img
                    src={shop.shop_image || shop.images[0]?.image}
                    alt={shop.shop_name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                    <Store className="h-8 w-8" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 truncate">{shop.shop_name}</h4>
                  <p className="text-sm text-gray-500">
                    Owner: {shop.owner_name || "N/A"} ({shop.owner_phone || "—"})
                  </p>
                  <p className="text-xs text-gray-400 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {formatAddress(shop.shop_address)}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-400">
                    {new Date(shop.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/admin-dashboard/shops/${shop.id}`)}
                      className="flex items-center text-green-600 text-xs hover:underline"
                    >
                      <Eye className="h-3 w-3 mr-1" /> View
                    </button>
                    <button className="flex items-center text-blue-600 text-xs hover:underline">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!previous}
          className={`px-4 py-2 rounded-lg border ${
            previous ? "bg-white hover:bg-gray-50 text-gray-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!next}
          className={`px-4 py-2 rounded-lg border ${
            next ? "bg-white hover:bg-gray-50 text-gray-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ShopsPage;
