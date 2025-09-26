// pages/RiderDashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../Layout/Layout";
import OrderTaking from "./Order/OrderTaking";
import ShopRegistration from "./ShopRegistration";
import { Store, Plus, MapPin, Edit, RefreshCcw } from "lucide-react";
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";
import { fetchOrders } from "../../store/slices/ordersSlice";
import { fetchSalesmanStats } from "../../store/slices/salesmanSlice";
import { fetchNearbyShops } from "../../store/slices/shopsSlice";
import { formatAddress } from "../../utils/formatAddress";

const RiderDashboard = () => {
  const [activeTab, setActiveTab] = useState("shops");
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [editingShop, setEditingShop] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { currentSalesmanLocation, stats, statsLoading, statsError } = useSelector((state) => state.salesmen);
  const salesmanId = user?.id;

  // ✅ Keeps sending location for backend tracking
  useRealTimeUpdates(salesmanId);

  const { nearbyShops, loading, error } = useSelector((state) => state.shops);
  const orders = useSelector((state) => state.orders.orders) || [];
  
  // Track if we already fetched shops after location is available
  const [hasFetchedShops, setHasFetchedShops] = useState(false);

  const dispatch = useDispatch();

  // Fetch orders and salesman stats once on mount
  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchSalesmanStats());
  }, [dispatch]);

  // ✅ New function to manually fetch shops
  const handleRefreshShops = () => {
    if (currentSalesmanLocation) {
      dispatch(
        fetchNearbyShops({
          lat: currentSalesmanLocation.lat,
          lng: currentSalesmanLocation.lng,
        })
      );
    } else {
      console.warn("Location not available. Cannot fetch shops.");
      // Optional: Display a user-friendly message
      dispatch(setShopsError("Please enable location services and try again."));
    }
  };

  useEffect(() => {
    if (currentSalesmanLocation && !hasFetchedShops) {
      handleRefreshShops();
      setHasFetchedShops(true);
    }
  }, [currentSalesmanLocation, hasFetchedShops]);

  const myOrders = orders.filter((order) => {
    if (String(order.order_taker) === String(salesmanId)) return true;
    if (String(order.salesmanId) === String(salesmanId)) return true;
    return false;
  });

  const handleEditShop = (shop) => {
    setEditingShop(shop);
    setActiveTab("register");
  };

  const handleRegistrationSuccess = () => {
    setEditingShop(null);
    setActiveTab("shops");
  };

  return (
    <Layout title="Rider Dashboard">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shops</p>
                <p className="text-3xl font-bold text-green-600">
                  {statsLoading ? "..." : stats.total_shops_by_user}
                </p>
              </div>
              <Store className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {statsLoading ? "..." : stats.total_orders}
                </p>
              </div>
              <Store className="h-12 w-12 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-3xl font-bold text-blue-600">
                  {statsLoading ? "..." : stats.today_orders}
                </p>
              </div>
              <Store className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        </div>

       {/* Shops Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100">
            <button
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium ${
                activeTab === "shops"
                  ? "text-green-600 border-b-2 border-green-500"
                  : "text-gray-500"
              }`}
              onClick={() => {
                setActiveTab("shops");
                setSelectedShopId(null);
                setEditingShop(null);
              }}
            >
              <Store className="h-5 w-5" />
              <span>My Shops</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === "shops"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {nearbyShops.length}
              </span>
            </button>
          </div>

          <div className="p-1 md:p-8 lg:p-12">
            {activeTab === "shops" && !selectedShopId && !editingShop && (
              <div className="space-y-4 p-2">
                {/* Header with Refresh and Register buttons */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Shops</h3>
                  <div className="flex items-center space-x-2">
                    {/* <button
                      onClick={handleRefreshShops}
                      className={`p-2 rounded-full ${
                        loading
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } transition-colors duration-200`}
                      disabled={loading}
                      aria-label="Refresh shops"
                    >
                      <RefreshCcw
                        className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                      />
                    </button> */}

                    <button
                      onClick={() => setActiveTab("register")}
                      className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Register Shop
                    </button>
                  </div>
                </div>

                {/* Shops content */}
                <div className="min-h-[300px] relative">
                  {loading ? (
                    // Loading spinner centered
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <RefreshCcw className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                        <p className="text-gray-500">Fetching nearby shops…</p>
                      </div>
                    </div>
                  ) : error ? (
                    // Show error
                    <p className="text-center text-red-500 py-6">{error}</p>
                  ) : nearbyShops.length === 0 ? (
                    // Empty state
                    <div className="text-center py-12">
                      <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No shops found nearby</p>
                    </div>
                  ) : (
                    // Shops list
                    <div className="grid gap-4">
                      {nearbyShops.map((shop) => (
                        <div
                          key={shop.id}
                          className="border border-gray-200 rounded-lg p-2 md:p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={(e) => {
                            if (e.target.closest("button")) return;
                            setSelectedShopId(shop.id);
                            setActiveTab("orderTaking");
                          }}
                        >
                          <div className="flex items-start space-x-4">
                            <img
                              src={shop.shop_image}
                              alt={shop.shop_name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {shop.shop_name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Owner: {shop.owner_name || "N/A"} (
                                {shop.owner_phone || "—"})
                              </p>
                              <p className="text-xs text-gray-400 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {formatAddress(shop.shop_address)}
                              </p>
                            </div>
                            <div className="text-right flex flex-col items-end space-y-1">
                              <p className="text-xs text-gray-400">Distance</p>
                              <p className="text-sm text-gray-600">
                                {shop.distance?.toFixed(2)} km
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(shop.created_at).toLocaleDateString()}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditShop(shop);
                                }}
                                className="mt-2 flex items-center text-blue-600 text-xs hover:underline"
                              >
                                <Edit className="h-3 w-3 mr-1" /> Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* OrderTaking */}
            {activeTab === "orderTaking" && selectedShopId && (
              <OrderTaking
                shopId={selectedShopId}
                onBack={() => {
                  setSelectedShopId(null);
                  setActiveTab("shops");
                }}
                onOrderSuccess={() => dispatch(fetchSalesmanStats())}
              />
            )}

            {/* Shop Registration */}
            {activeTab === "register" && (
              <ShopRegistration
                shop={editingShop}
                mode={editingShop ? "edit" : "create"}
                onSuccess={handleRegistrationSuccess}
              />
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default RiderDashboard;