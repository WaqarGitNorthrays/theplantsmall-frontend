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
  ChevronDown,
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
  <div className="min-h-screen bg-white rounded-xl p-3 sm:p-4 md:p-6">
    <div className="max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Shops Directory
              {totalCount > 0 && (
                <span className="ml-2 text-base sm:text-lg font-normal text-gray-500">
                  ({totalCount})
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and view all registered shops</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-4 sm:mb-6">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-white">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search & Filter
          </h3>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <div className="lg:col-span-2 xl:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Search Shops
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Shop name, owner..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                           rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                           focus:border-green-500 focus:bg-white transition-all duration-200 
                           placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, status: e.target.value }))
                  }
                  className="w-full appearance-none px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                           rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                           focus:border-green-500 focus:bg-white transition-all duration-200 
                           cursor-pointer pr-10"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="close">Close</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Created After */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                From Date
              </label>
              <input
                type={filters.created_after ? "date" : "text"}
                placeholder="Start date"
                value={filters.created_after}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, created_after: e.target.value }))
                }
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Created Before */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                To Date
              </label>
              <input
                type={filters.created_before ? "date" : "text"}
                placeholder="End date"
                value={filters.created_before}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, created_before: e.target.value }))
                }
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Registered By */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Registered By
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Salesman name"
                  value={filters.registered_by}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, registered_by: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                           rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                           focus:border-green-500 focus:bg-white transition-all duration-200 
                           placeholder:text-gray-400"
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
                className="flex items-center gap-1.5 text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 
                         rounded-xl text-gray-700 font-medium transition-colors"
              >
                <X className="h-4 w-4" /> Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-500">Loading shops...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-12 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">⚠</span>
          </div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No shops found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          {/* Shop Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200/60 
                         hover:shadow-lg hover:border-green-200 transition-all duration-300 
                         hover:-translate-y-1 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  {shop.shop_image || shop.images?.length > 0 ? (
                    <img
                      src={shop.shop_image || shop.images[0]?.image}
                      alt={shop.shop_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {shop.status && (
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border
                          ${
                            shop.status === "open"
                              ? "bg-green-500/90 text-white border-green-400"
                              : "bg-red-500/90 text-white border-red-400"
                          }`}
                      >
                        {shop.status === "open" ? "Open" : "Closed"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  {/* Shop Name */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-green-600 transition-colors">
                    {shop.shop_name}
                  </h3>

                  {/* Owner Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 truncate">
                          {shop.owner_name || "N/A"}
                        </p>
                        {shop.owner_phone && (
                          <p className="text-xs text-gray-500">{shop.owner_phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    {shop.shop_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600 line-clamp-2 flex-1">
                          {formatAddress(shop.shop_address)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(shop.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() =>
                        navigate(`/admin-dashboard/shops/${shop.id}`)
                      }
                      className="flex items-center gap-1.5 text-green-600 text-sm font-semibold 
                               hover:text-green-700 group-hover:gap-2 transition-all"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(previous || next) && (
            <div className="mt-6 sm:mt-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={!previous}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 
                             bg-white border border-gray-200 rounded-xl hover:bg-gray-50 
                             transition-all disabled:opacity-40 disabled:cursor-not-allowed 
                             disabled:hover:bg-white focus:outline-none focus:ring-2 
                             focus:ring-green-500/20"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                    <span className="hidden xs:inline">Previous</span>
                  </button>

                  {/* Page Info */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Page <span className="font-semibold text-gray-900">{page}</span>
                    </span>
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!next}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 
                             bg-white border border-gray-200 rounded-xl hover:bg-gray-50 
                             transition-all disabled:opacity-40 disabled:cursor-not-allowed 
                             disabled:hover:bg-white focus:outline-none focus:ring-2 
                             focus:ring-green-500/20"
                  >
                    <span className="hidden xs:inline">Next</span>
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>

                {/* Results Info */}
                {totalCount > 0 && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                      Showing {shops.length} of {totalCount} shops
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
};

export default ShopsPage;
