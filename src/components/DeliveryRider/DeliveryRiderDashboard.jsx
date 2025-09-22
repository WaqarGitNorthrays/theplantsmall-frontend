// src/components/rider/DeliveryRiderDashboard.jsx

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
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
  Clock,
  DollarSign,
} from "lucide-react";
import DeliveryOrderCard from "./DeliveryOrderCard";
import { ORDER_STATUS, PAYMENT_STATUS } from "./DeliveryRiderDashboard.constants";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("");

  const totalPages = Math.ceil(count / pageSize);

  useEffect(() => {
    dispatch(
      fetchOrders({
        page,
        pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
        payment_status: paymentFilter || undefined,
      })
    );
    dispatch(fetchDeliveryRiderStats());
  }, [dispatch, page, pageSize, statusFilter, paymentFilter]);

  // Orders are now filtered by backend, so use orders directly
  const filteredOrders = orders || [];

  // Best practice: single handler for child order card
  const handleUpdateOrder = async (orderId, updates, refreshStats) => {
    // Only allow status update to 'delivered' if payment_status is set
    if (updates.status === "delivered") {
      if (!updates.payment_status) {
        toast.error("Please select payment status before marking as delivered.");
        return false;
      }
      const res = await dispatch(
        updateOrder({
          orderId,
          updates: {
            status: "delivered",
            payment_status: updates.payment_status,
          },
        })
      );
      if (res.error) {
        toast.error(res.error.message || "Failed to update order");
        return false;
      } else {
        toast.success("Order marked as Delivered");
        if (refreshStats) refreshStats();
        return true;
      }
    }
    // For payment status update only
    if (updates.payment_status && !updates.status) {
      const res = await dispatch(
        updateOrder({
          orderId,
          updates: {
            payment_status: updates.payment_status,
          },
        })
      );
      if (res.error) {
        toast.error(res.error.message || "Failed to update payment status");
        return false;
      } else {
        toast.success("Payment status updated");
        if (refreshStats) refreshStats();
        return true;
      }
    }
    // For other status updates
    const res = await dispatch(
      updateOrder({
        orderId,
        updates: {
          ...updates,
        },
      })
    );
    if (res.error) {
      toast.error(res.error.message || "Failed to update order");
      return false;
    } else {
      toast.success("Order updated");
      if (refreshStats) refreshStats();
      return true;
    }
  };

  return (
    <Layout title="Delivery Rider Dashboard">
      <div className="space-y-10 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
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
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">
                  {stats.delivered}
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
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                  <option value="all">All Orders</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                  <option value="">All Payments</option>
                  {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
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
                  <DeliveryOrderCard
                    key={order.id}
                    order={order}
                    onUpdate={(orderId, updates) => handleUpdateOrder(orderId, updates, () => dispatch(fetchDeliveryRiderStats()))}
                  />
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