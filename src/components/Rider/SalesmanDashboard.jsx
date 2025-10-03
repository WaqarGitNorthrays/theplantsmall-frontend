// pages/RiderDashboard.jsx
import React, { useEffect, useState, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { Store } from "lucide-react";
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";
import { fetchOrders } from "../../store/slices/ordersSlice";
import { fetchSalesmanStats } from "../../store/slices/salesmanSlice";
import { fetchNearbyShops } from "../../store/slices/shopsSlice";
import ShopsList from "./ShopsList";
import ShopRegistration from "./ShopRegistration";

// Lazy load large pages
const OrderTaking = React.lazy(() => import("./Order/OrderTaking"));
const OrderReceipt = React.lazy(() => import("./Order/OrderReceipt"));

// ✅ Centralized routes for scalability
const ROUTES = {
  base: "/salesman-dashboard",
  shops: "/salesman-dashboard/shops",
  orderTaking: (shopId) => `/salesman-dashboard/shops/${shopId}/order-taking`,
  receipt: "/salesman-dashboard/order-receipt",
  shopCreate: "/salesman-dashboard/shops/create",
  shopEdit: (shopId) => `/salesman-dashboard/shops/${shopId}/edit`,
};

// ✅ Reusable Stats Card Component
const StatsCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className={`text-3xl font-bold text-${color}-600`}>
          {value ?? "..."}
        </p>
      </div>
      <Icon className={`h-12 w-12 text-${color}-500`} />
    </div>
  </div>
);

const RiderDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentSalesmanLocation, stats, statsLoading } = useSelector(
    (state) => state.salesmen
  );
  const { nearbyShops, loading, error } = useSelector((state) => state.shops);

  const salesmanId = user?.id;
  useRealTimeUpdates(salesmanId);

  const [hasFetchedShops, setHasFetchedShops] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch once on mount
  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchSalesmanStats());
  }, [dispatch]);

  // Refresh shops when location is available
  const handleRefreshShops = (force = false) => {
    if (!force && nearbyShops?.length > 0) return;
    if (currentSalesmanLocation) {
      dispatch(
        fetchNearbyShops({
          lat: currentSalesmanLocation.lat,
          lng: currentSalesmanLocation.lng,
        })
      );
    }
  };

  useEffect(() => {
    if (currentSalesmanLocation && !hasFetchedShops) {
      handleRefreshShops();
      setHasFetchedShops(true);
    }
  }, [currentSalesmanLocation, hasFetchedShops]);

  return (
    <Layout title="Salesman Dashboard">
      <div className="space-y-6">
        {/* ✅ Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            label="Total Shops"
            value={statsLoading ? "..." : stats.total_shops_by_user}
            icon={Store}
            color="emerald"
          />
          <StatsCard
            label="Total Orders"
            value={statsLoading ? "..." : stats.total_orders}
            icon={Store}
            color="emerald"
          />
          <StatsCard
            label="Today's Orders"
            value={statsLoading ? "..." : stats.today_orders}
            icon={Store}
            color="emerald"
          />
        </div>

        {/* ✅ Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-1 md:p-8 lg:p-4">
            {/* Sticky Tab Navigation */}
            <div className="flex border-b border-gray-100 mb-4">
              <button
                className="flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium text-green-600 border-b-2 border-green-500"
                onClick={() => navigate(ROUTES.shops)}
              >
                <Store className="h-5 w-5" />
                <span>My Shops</span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                  {nearbyShops?.length ?? 0}
                </span>
              </button>
            </div>

            {/* Nested Routes */}
            <Suspense fallback={<p className="text-center py-6">Loading...</p>}>
              <Routes>
                <Route path="/" element={<Navigate to="shops" replace />} />
                <Route
                  path="shops"
                  element={
                    <ShopsList
                      nearbyShops={nearbyShops}
                      loading={loading}
                      error={error}
                      basePath={ROUTES.base}
                      handleRefreshShops={handleRefreshShops}
                    />
                  }
                />
                <Route
                  path="shops/:shopId/order-taking"
                  element={
                    <OrderTaking
                      onOrderSuccess={() => {
                        dispatch(fetchSalesmanStats());
                      }}
                    />
                  }
                />
                <Route path="order-receipt" element={<OrderReceipt />} />
                <Route
                  path="shops/create"
                  element={
                    <ShopRegistration
                      mode="create"
                      onSuccess={() => handleRefreshShops(true)}
                    />
                  }
                />
                <Route
                  path="shops/:shopId/edit"
                  element={<ShopRegistration mode="edit" />}
                />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RiderDashboard;
