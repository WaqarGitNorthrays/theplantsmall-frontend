// pages/RiderDashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../Layout/Layout";
import OrderTaking from "./Order/OrderTaking";
import ShopRegistration from "./ShopRegistration";
import { Store, Plus, MapPin, Edit } from "lucide-react";
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";
import { fetchOrders } from "../../store/slices/ordersSlice";
import { fetchNearbyShops } from "../../store/slices/shopsSlice"; // ✅ import explicitly
import { formatAddress } from "../../utils/formatAddress";

const RiderDashboard = () => {
  const [activeTab, setActiveTab] = useState("shops");
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [editingShop, setEditingShop] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const salesmanId = user?.id || "salesman1";

  // ✅ keeps sending location every minute (backend tracking)
  useRealTimeUpdates(salesmanId);

  const { nearbyShops, loading, error } = useSelector((state) => state.shops);
  const orders = useSelector((state) => state.orders.orders);

  const dispatch = useDispatch();

  // Fetch orders once on mount
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // ✅ Fetch nearby shops ONLY on initial load/refresh
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          dispatch(fetchNearbyShops({ lat, lng }));
        },
        (err) => {
          console.error("Error fetching current location:", err);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [dispatch]);

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
                  {nearbyShops.length}
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
                  {myOrders.length}
                </p>
              </div>
              <Store className="h-12 w-12 text-emerald-500" />
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

          <div className="p-2 md:p-8 lg:p-12">
            {/* Shops Tab */}
            {activeTab === "shops" && !selectedShopId && !editingShop && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Registered Shops
                  </h3>
                  <button
                    onClick={() => setActiveTab("register")}
                    className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register Shop
                  </button>
                </div>

                {loading && (
                  <p className="text-center text-gray-500 py-6">
                    Fetching nearby shops...
                  </p>
                )}
                {error && (
                  <p className="text-center text-red-500 py-6">{error}</p>
                )}
                {!loading && nearbyShops.length === 0 && !error && (
                  <div className="text-center py-12">
                    <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No shops found nearby</p>
                  </div>
                )}

                {/* Shops List */}
                <div className="grid gap-4">
                  {(nearbyShops || []).map((shop) => (
                    <div
                      key={shop.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
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
