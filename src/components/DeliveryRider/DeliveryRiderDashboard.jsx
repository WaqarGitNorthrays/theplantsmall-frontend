// src/components/rider/DeliveryRiderDashboard.jsx

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchOrders,
  updateOrder,
  setPage,
} from "../../store/slices/ordersSlice";
import { fetchDeliveryRiderStats } from "../../store/slices/deliveryRiderStatsSlice.js";
import Layout from "../Layout/Layout.jsx";
import {
  Package,
  CheckCircle,
  Filter,
  Tag,
  Store,
  Calendar,
  DollarSign,
  Clock, // Added Clock icon
} from "lucide-react";

// Delivery Rider can only move "ready → delivered"
const ORDER_STATUS = {
  ready: "Ready for Pickup",
  delivered: "Delivered",
};

// Payment status options
const PAYMENT_STATUS = {
  unpaid: "Unpaid",
  paid: "Paid",
  refunded: "Refunded",
};

export default function DeliveryRiderDashboard() {
  const dispatch = useDispatch();

  // Redux Slices
  const { orders, loading, error, page, pageSize, count } = useSelector(
    (s) => s.orders
  );
  const {
    stats = { total_orders: 0, orders_today: 0, preparing: 0, ready: 0 },
    loading: statsLoading,
    error: statsError,
  } = useSelector((s) => s.deliveryRiderStats|| {});

  // Local state
  const [filter, setFilter] = useState("all");

  const totalPages = Math.ceil(count / pageSize);

  useEffect(() => {
    dispatch(fetchOrders({ page, pageSize }));
    dispatch(fetchDeliveryRiderStats());
  }, [dispatch, page, pageSize]);

  const filteredOrders = (orders || []).filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "ready":
        return "text-lime-700 bg-lime-100";
      case "delivered":
        return "text-emerald-700 bg-emerald-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const handleUpdateOrder = (orderId, updates) => {
    dispatch(
      updateOrder({
        orderId,
        updates: {
          ...updates,
        },
      })
    );
  };

  return (
    <Layout title="Delivery Rider Dashboard">
      <div className="space-y-10 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready</p>
                <p className="text-4xl font-bold text-lime-600 mt-2">
                  {stats.ready}
                </p>
              </div>
              <CheckCircle className="h-16 w-16 text-gray-200 group-hover:text-lime-300 transition-colors duration-300" />
            </div>
          </div>
          {/* RESOLVED: Changed "Delivered" card to "Preparing" to match API data */}
          <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600">Preparing</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">
                  {stats.preparing}
                </p>
              </div>
              <Clock className="h-16 w-16 text-gray-200 group-hover:text-yellow-300 transition-colors duration-300" />
            </div>
          </div>
          <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {stats.total_orders}
                </p>
              </div>
              <Package className="h-16 w-16 text-gray-200 group-hover:text-blue-300 transition-colors duration-300" />
            </div>
          </div>
          <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Orders Today
                </p>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {stats.orders_today}
                </p>
              </div>
              <DollarSign className="h-16 w-16 text-gray-200 group-hover:text-purple-300 transition-colors duration-300" />
            </div>
          </div>
        </div>

        {/* Orders Management */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              >
                <option value="all">All Orders</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {loading && (
              <p className="text-center text-gray-500 py-12">
                Loading orders...
              </p>
            )}
            {error && (
              <p className="text-center text-red-500 py-12">Error: {error}</p>
            )}
            {!loading && !error && filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  No orders found for the selected filter.
                </p>
              </div>
            )}

            {!loading && !error && filteredOrders.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border-2 border-transparent rounded-xl p-6 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 text-lg">
                        Order #{order.order_number}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs text-nowrap font-semibold w-max ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {ORDER_STATUS[order.status] || order.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-gray-400" />
                        <span>{order.shop_name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-3xl font-bold text-green-600 mt-2 text-center">
                      Rs. {Number(order.total_amount).toLocaleString()}
                    </p>

                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <h5 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        Items:
                      </h5>
                      <div className="space-y-1 text-sm text-gray-600 max-h-24 overflow-y-auto custom-scrollbar">
                        {order.items?.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between p-2 rounded-md bg-gray-50"
                          >
                            <span>
                              {item.quantity}x {item.product_name}
                            </span>
                            <span>
                              Rs. {Number(item.unit_price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status + Payment Controls */}
                    <div className="space-y-3 mt-4">
                      <label className="block text-sm font-semibold text-gray-800">
                        Update Delivery Status:
                      </label>
                      <select
                        value={order.status || ""}
                        onChange={(e) =>
                          handleUpdateOrder(order.id, {
                            status: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm rounded-md border shadow-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      >
                        <option value="">-- Select Status --</option>
                        {Object.entries(ORDER_STATUS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>

                      <label className="block text-sm font-semibold text-gray-800">
                        Update Payment Status:
                      </label>
                      <select
                        value={order.payment_status || "unpaid"}
                        onChange={(e) =>
                          handleUpdateOrder(order.id, {
                            payment_status: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm rounded-md border shadow-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      >
                        {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white rounded-b-2xl shadow-sm">
            <button
              onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
              disabled={page === 1}
              className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-gray-100 transition disabled:opacity-50"
            >
              &larr; Previous
            </button>
            <span className="text-sm text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() =>
                dispatch(setPage(Math.min(totalPages, page + 1)))
              }
              disabled={page === totalPages}
              className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-gray-100 transition disabled:opacity-50"
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}