// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import AllOrders from "./AllOrders";
import { fetchDashboardStats } from "../../store/slices/dashboardSlice";
import ProductsPage from "./products/ProductsPage";
import ProductFormPage from "./products/ProductFormPage";
import ProductDetailsPage from "./products/ProductDetailsPage";
import UsersPage from "./users/UsersPage";
import UserFormPage from "./users/UserFormPage ";
import MapPage from "./map/MapPage";
import ShopsPage from "./shops/ShopsPage";
import ShopDetailsPage from "./shops/ShopDetailsPage";
import ShopEditPage from "./shops/ShopEditPage";

import {
  BarChart3,
  TrendingUp, 
  Users,
  Store,
  Package,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Menu,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats } = useSelector((state) => state.dashboard);
  const shops = useSelector((state) => state.shops.shops || []);
  const orders = useSelector((state) => state.orders.orders || []);

  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      dispatch(fetchDashboardStats());
      hasFetched.current = true;
    }
  }, [dispatch]);

  const filteredOrders = orders.filter((order) => {
    const shopName = shops.find((s) => s.id === order.shopId)?.name || "";
    return (
      shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm)
    );
  });

  return (
  <Layout title="Admin Dashboard">
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 space-y-4 sm:space-y-6 md:ml-6 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200/60">
          <h2 className="text-xl font-bold text-green-600">Admin</h2>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Nested Routes */}
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/admin-dashboard/dashboard" replace />}
          />

          {/* Dashboard Tab */}
          <Route
            path="dashboard"
            element={
              <>
                {/* Real-time Status Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl shadow-lg">
                  {/* Decorative Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                  </div>

                  <div className="relative p-5 sm:p-6 lg:p-8 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                          Real-time Operations
                        </h2>
                        <p className="text-green-100 text-sm">Live business metrics and insights</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3 sm:mt-0 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-xs font-medium">
                          {lastUpdated.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all border border-white/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm font-medium mb-1">Active Salesmen</p>
                            <p className="text-4xl font-bold">
                              {stats?.real_time_operations?.active_salesmen || 0}
                            </p>
                          </div>
                          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="h-7 w-7 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all border border-white/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm font-medium mb-1">Orders Today</p>
                            <p className="text-4xl font-bold">
                              {stats?.real_time_operations?.orders_today || 0}
                            </p>
                          </div>
                          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-7 w-7 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all border border-white/20 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm font-medium mb-1">Revenue Today</p>
                            <p className="text-4xl font-bold">
                              Rs {stats?.real_time_operations?.revenue_today || 0}
                            </p>
                          </div>
                          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BarChart3 className="h-7 w-7 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="group bg-white rounded-xl p-5 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-purple-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Shops</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats?.shops?.total || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <Store className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-xl p-5 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-orange-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats?.shops?.pending || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-xl p-5 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-green-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Ready</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats?.shops?.ready || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-xl p-5 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats?.shops?.completed || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-xl p-5 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-red-200 transition-all sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Cancelled</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats?.shops?.cancelled || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Salesmen */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                  <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Active Salesmen</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Current team performance</p>
                      </div>
                      <div className="px-3 py-1 bg-green-100 rounded-full">
                        <span className="text-xs font-semibold text-green-700">
                          {stats?.active_salesmen?.length || 0} Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    {stats?.active_salesmen && stats.active_salesmen.length > 0 ? (
                      <div className="space-y-3">
                        {stats.active_salesmen.map((s) => (
                          <div
                            key={s.id}
                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-200 border border-transparent transition-all"
                          >
                            <div className="flex items-center gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                                <Users className="h-6 w-6 text-green-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-gray-900 truncate">{s.name}</h4>
                                <p className="text-sm text-gray-600">{s.phone || "—"}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                              <div className="flex items-center gap-4 flex-1 sm:flex-none">
                                <div className="text-center">
                                  <p className="text-lg font-bold text-gray-900">{s.shops_count}</p>
                                  <p className="text-xs text-gray-500">Shops</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-bold text-gray-900">{s.orders_count}</p>
                                  <p className="text-xs text-gray-500">Orders</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    s.status === "online" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                                  }`}
                                ></div>
                                <span
                                  className={`text-xs font-medium ${
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
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500">No active salesmen at the moment</p>
                      </div>
                    )}
                  </div>
                </div>

                <AllOrders
                  filteredOrders={filteredOrders}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </>
            }
          />

          {/* Other Tabs */}
          <Route path="users" element={<UsersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="shops/:shopId" element={<ShopDetailsPage />} /> 
          <Route path="shops/:shopId/edit" element={<ShopEditPage />} /> 
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/edit/:id" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route path="users/new" element={<UserFormPage />} />
          <Route path="users/edit/:id" element={<UserFormPage />} />
        </Routes>
      </div>
    </div>
  </Layout>
);
};

export default AdminDashboard;
