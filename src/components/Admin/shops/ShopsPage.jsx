// src/pages/admin/shops/ShopsPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllShops } from "../../../store/slices/shopsSlice";
import {
  Store,
  MapPin,
  RefreshCcw,
  Eye,
  Search,
  X,
  User,
} from "lucide-react";
import { formatAddress } from "../../../utils/formatAddress";
import { useNavigate } from "react-router-dom";

const ShopsPage = () => {
  const dispatch = useDispatch();
  const { shops, loading, error, totalCount, next, previous } = useSelector(
    (state) => state.shops
  );

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    created_before: "",
    created_after: "",
    registered_by: "",
  });

  const navigate = useNavigate();

  // Fetch shops with filters
  useEffect(() => {
    dispatch(fetchAllShops({ page, ...filters }));
  }, [dispatch, page, filters]);

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      created_before: "",
      created_after: "",
      registered_by: "",
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Shops{" "}
          <span className="text-sm font-medium text-gray-500">
            ({totalCount})
          </span>
        </h2>
        <button
          onClick={() => dispatch(fetchAllShops({ page, ...filters }))}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
        >
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search shops..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="close">Close</option>
            </select>
          </div>

          {/* Created After */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Created After
            </label>
            <input
              type="date"
              value={filters.created_after}
              onChange={(e) =>
                setFilters((f) => ({ ...f, created_after: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Created Before */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Created Before
            </label>
            <input
              type="date"
              value={filters.created_before}
              onChange={(e) =>
                setFilters((f) => ({ ...f, created_before: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Registered By */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Registered By
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Salesman name..."
                value={filters.registered_by}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, registered_by: e.target.value }))
                }
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Reset Filters */}
        {(filters.search ||
          filters.status ||
          filters.created_before ||
          filters.created_after ||
          filters.registered_by) && (
          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="flex items-center text-sm px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
            >
              <X className="h-4 w-4 mr-1" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-6">
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition transform hover:-translate-y-1 bg-white flex flex-col"
              >
                {/* Image */}
                {shop.shop_image || shop.images?.length > 0 ? (
                  <img
                    src={shop.shop_image || shop.images[0]?.image}
                    alt={shop.shop_name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                    <Store className="h-8 w-8" />
                  </div>
                )}

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                    {shop.shop_name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    Owner: {shop.owner_name || "N/A"} (
                    {shop.owner_phone || "—"})
                  </p>
                  <p className="text-xs text-gray-500 flex items-center mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {formatAddress(shop.shop_address)}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {new Date(shop.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() =>
                        navigate(`/admin-dashboard/shops/${shop.id}`)
                      }
                      className="flex items-center text-green-600 text-sm font-medium hover:underline"
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!previous}
          className={`px-4 py-2 rounded-lg border ${
            previous
              ? "bg-white hover:bg-gray-50 text-gray-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!next}
          className={`px-4 py-2 rounded-lg border ${
            next
              ? "bg-white hover:bg-gray-50 text-gray-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ShopsPage;
