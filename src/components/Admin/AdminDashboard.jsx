import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../Layout/Layout";
import AllOrders from "./AllOrders";
import { fetchDashboardStats } from "../../store/slices/dashboardSlice";
import ProductsPage from "./products/ProductsPage";
import UsersPage from "./users/UsersPage";
import {
  BarChart3,
  TrendingUp,
  Users,
  Store,
  Package,
  RefreshCw,
  Clock,
  CheckCircle,
  Grid,
  UserPlus,
  ShoppingBag,
  Layers,
  XCircle
} from "lucide-react";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);
  const shops = useSelector((state) => state.shops.shops || []);
  const orders = useSelector((state) => state.orders.orders || []);

  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard"); // NEW

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Optional: auto-refresh stats every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchDashboardStats());
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Orders filter
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const readyOrders = orders.filter((order) => order.status === "ready");
  const completedOrders = orders.filter((order) => order.status === "delivered");

  const filteredOrders = orders.filter((order) => {
    const shopName = shops.find((s) => s.id === order.shopId)?.name || "";
    return (
      shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-100 rounded-xl mr-6 hidden md:block">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-green-600">Admin</h2>
          </div>
          <nav className="p-4 space-y-2">
            {["dashboard", "users", "products"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab
                    ? "bg-green-100 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {{
                  dashboard: <Grid className="h-5 w-5" />,
                  users: <UserPlus className="h-5 w-5" />,
                  products: <ShoppingBag className="h-5 w-5" />,
                }[tab]}
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "dashboard" && (
            <>
              {/* Real-time Status */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Real-time Operations</h2>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-sm opacity-90">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Active Salesmen</p>
                        <p className="text-3xl font-bold">
                          {stats?.real_time_operations?.active_salesmen || 0}
                        </p>
                      </div>
                      <Users className="h-10 w-10 text-green-200" />
                    </div>
                  </div>

                  <div className="bg-white/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Orders Today</p>
                        <p className="text-3xl font-bold">
                          {stats?.real_time_operations?.orders_today || 0}
                        </p>
                      </div>
                      <TrendingUp className="h-10 w-10 text-green-200" />
                    </div>
                  </div>

                  <div className="bg-white/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Revenue Today</p>
                        <p className="text-3xl font-bold">
                          Rs{stats?.real_time_operations?.revenue_today || 0}
                        </p>
                      </div>
                      <BarChart3 className="h-10 w-10 text-green-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Shops</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats?.shops?.total || 0}
                      </p>
                    </div>
                    <Store className="h-10 w-10 text-purple-500" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats?.shops?.pending || 0}
                      </p>
                    </div>
                    <Clock className="h-10 w-10 text-orange-500" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ready</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.shops?.ready || 0}
                      </p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats?.shops?.completed || 0}
                      </p>
                    </div>
                    <Package className="h-10 w-10 text-blue-500" />
                  </div>
                </div>
                  {/* Cancelled - new */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats?.shops?.cancelled || 0}
                    </p>
                  </div>
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
              </div>
              </div>

              {/* Salesmen */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Active Salesmen
                  </h3>
                </div>
                <div className="p-6 grid gap-4">
                  {stats?.active_salesmen?.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{s.name}</h4>
                          <p className="text-sm text-gray-600">{s.phone || "-"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{s.shops_count}</p>
                          <p className="text-xs text-gray-500">Shops</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{s.orders_count}</p>
                          <p className="text-xs text-gray-500">Orders</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 ${
                              s.status === "online" ? "bg-green-500" : "bg-gray-400"
                            } rounded-full animate-pulse`}
                          ></div>
                          <span
                            className={`text-sm ${
                              s.status === "online" ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            {s.status === "online" ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <AllOrders
                filteredOrders={filteredOrders}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </>
          )}

          {activeTab === "users" && <UsersPage />}

          {activeTab === "products" && <ProductsPage />}

        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
