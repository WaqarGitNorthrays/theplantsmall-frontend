import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchOrders,
  updateOrder,
  setPage,
} from "../../store/slices/ordersSlice";
import { fetchRiders } from "../../store/slices/riderSlice";
import {
  ClipboardList,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Store,
  Hash,
  Filter,
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import OrderDetailModal from "./OrderDetailModal.jsx";
import StatusModal from "./StatusModal";
import { toast } from "react-toastify";

const ORDER_STATUS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_STATUS = {
  unpaid: "Unpaid",
  paid: "Paid",
  refunded: "Refunded",
};

export default function AllOrders() {
  const dispatch = useDispatch();
  const { orders, loading, error, page, pageSize, count } = useSelector(
    (state) => state.orders
  );
  const { riders, loading: ridersLoading } = useSelector((state) => state.riders);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [modalOrder, setModalOrder] = useState(null);
  const [modalStatus, setModalStatus] = useState(null);
  const [modalPaymentStatus, setModalPaymentStatus] = useState(null);
  const [riderAssignments, setRiderAssignments] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(count / pageSize);

  // Fetch riders on component mount
  useEffect(() => {
    dispatch(fetchRiders());
  }, [dispatch]);

  // Helper function for status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-lime-100 text-lime-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch orders
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(
        fetchOrders({
          page,
          pageSize,
          search: searchTerm,
          status: statusFilter,
          payment_status: paymentFilter,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        })
      );
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [
    dispatch,
    page,
    pageSize,
    searchTerm,
    statusFilter,
    paymentFilter,
    startDate,
    endDate,
  ]);

  const handleStatusChange = (order, newStatus) => {
    if (
      ["confirmed", "cancelled", "delivered", "preparing", "ready", "pending"].includes(
        newStatus
      )
    ) {
      setModalOrder(order);
      setModalStatus(newStatus);
      setModalPaymentStatus(null);
    } else {
      dispatch(updateOrder({ orderId: order.id, updates: { status: newStatus } }));
    }
  };

  const handlePaymentStatusChange = (order, newPaymentStatus) => {
    if (["unpaid", "paid", "refunded"].includes(newPaymentStatus)) {
      setModalOrder(order);
      setModalStatus(null);
      setModalPaymentStatus(newPaymentStatus);
    } else {
      dispatch(updateOrder({ orderId: order.id, updates: { payment_status: newPaymentStatus } }));
    }
  };

  const handleModalConfirm = (updates) => {
    if (modalOrder) {
      dispatch(updateOrder({ orderId: modalOrder.id, updates })).then((res) => {
        if (!res.error) {
          toast.success(
            updates.payment_status
              ? `Payment status updated to ${updates.payment_status}`
              : `Order status updated to ${updates.status}`
          );
        }
      });
    }
    setModalOrder(null);
    setModalStatus(null);
    setModalPaymentStatus(null);
    setRiderAssignments({});
  };

  // Handle rider assignment in mobile view
  const handleAssignRider = (orderId) => {
    const riderId = riderAssignments[orderId];
    if (!riderId) {
      toast.error("Please select a rider before confirming.");
      return;
    }

    dispatch(
      updateOrder({
        orderId,
        updates: { status: "ready", delivery_rider: riderId },
      })
    ).then((res) => {
      if (!res.error) {
        toast.success("Order is Ready for Pickup");
      }
    });

    setRiderAssignments((prev) => {
      const copy = { ...prev };
      delete copy[orderId];
      return copy;
    });
  };

 const activeFiltersCount = [statusFilter, paymentFilter, startDate, endDate].filter(Boolean).length;

return (
  <div className="min-h-screen bg-gray-50/50 p-3 sm:p-4 md:p-6">
    <div className="max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <ClipboardList className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage all your orders</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-white space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by order number, shop name, or salesman..."
              value={searchTerm}
              onChange={(e) => {
                dispatch(setPage(1));
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 
                       focus:bg-white transition-all duration-200 placeholder:text-gray-400"
            />
          </div>

          {/* Filter Toggle Button - Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 
                     border border-gray-200 rounded-xl text-sm font-medium text-gray-700 
                     hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {/* Filters */}
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Filters Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  dispatch(setPage(1));
                  setStatusFilter(e.target.value);
                }}
                className="w-full appearance-none px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200 
                         cursor-pointer pr-10"
              >
                <option value="">All Status</option>
                {Object.entries(ORDER_STATUS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Payment Filter */}
            <div className="relative">
              <select
                value={paymentFilter}
                onChange={(e) => {
                  dispatch(setPage(1));
                  setPaymentFilter(e.target.value);
                }}
                className="w-full appearance-none px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200 
                         cursor-pointer pr-10"
              >
                <option value="">All Payments</option>
                {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Start Date */}
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={startDate ? "date" : "text"}
                placeholder="Start Date"
                value={startDate}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                onChange={(e) => {
                  dispatch(setPage(1));
                  setStartDate(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={endDate ? "date" : "text"}
                placeholder="End Date"
                value={endDate}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                onChange={(e) => {
                  dispatch(setPage(1));
                  setEndDate(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-500">Loading orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-xl">⚠</span>
            </div>
            <p className="text-sm text-red-600">Error: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No orders found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && !error && orders.length > 0 && (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Salesman</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shop</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => {
                    const productsPreview = order.items
                      .map((item) => item.product_name)
                      .slice(0, 2)
                      .join(", ");
                    const moreCount =
                      order.items.length > 2 ? ` +${order.items.length - 2}` : "";

                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                              <Hash className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{order.order_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{order.order_taker_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{order.shop_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {productsPreview}
                            {moreCount && <span className="text-gray-400">{moreCount}</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order, e.target.value)}
                              className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border cursor-pointer
                                        focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all
                                        ${getStatusColor(order.status)}`}
                            >
                              {Object.entries(ORDER_STATUS).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                          </div>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <select
                              value={order.payment_status}
                              onChange={(e) => handlePaymentStatusChange(order, e.target.value)}
                              className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border cursor-pointer
                                        focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all
                                        ${getPaymentColor(order.payment_status)}`}
                            >
                              {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            Rs. {Number(order.total_amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div key={order.id} className="bg-white">
                    {/* Card Header */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-4 cursor-pointer active:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                            <Hash className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold text-gray-900 truncate">#{order.order_number}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(order.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${getStatusColor(order.status)}`}>
                          {ORDER_STATUS[order.status]}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${getPaymentColor(order.payment_status)}`}>
                          {PAYMENT_STATUS[order.payment_status]}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-gray-900 bg-gray-50 rounded-lg border border-gray-200">
                          Rs. {Number(order.total_amount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                        {/* Info Grid */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-500 mb-0.5">Salesman</p>
                              <p className="text-sm text-gray-900 break-words">{order.order_taker_name}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Store className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-500 mb-0.5">Shop</p>
                              <p className="text-sm text-gray-900 break-words">{order.shop_name}</p>
                            </div>
                          </div>
                        </div>

                        {/* Products */}
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Products</h4>
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm bg-white rounded-lg p-2.5">
                                <span className="text-gray-700 flex-1 min-w-0 pr-2">
                                  <span className="break-words">{item.product_name}</span>
                                  <span className="text-gray-400 ml-1">×{item.quantity}</span>
                                </span>
                                <span className="text-gray-900 font-medium whitespace-nowrap">
                                  Rs. {Number(item.unit_price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status Update */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Update Status
                          </label>
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order, e.target.value)}
                              className="w-full appearance-none px-4 py-3 text-sm bg-gray-50 border border-gray-200 
                                       rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                       focus:border-green-500 transition-all pr-10"
                            >
                              {Object.entries(ORDER_STATUS).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Payment Status Update */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Update Payment
                          </label>
                          <div className="relative">
                            <select
                              value={order.payment_status}
                              onChange={(e) => handlePaymentStatusChange(order, e.target.value)}
                              className="w-full appearance-none px-4 py-3 text-sm bg-gray-50 border border-gray-200 
                                       rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                       focus:border-green-500 transition-all pr-10"
                            >
                              {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Rider Assignment */}
                        {riderAssignments[order.id] !== undefined && (
                          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <label className="block text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">
                              Assign Rider
                            </label>
                            <div className="relative mb-3">
                              <select
                                value={riderAssignments[order.id]}
                                onChange={(e) =>
                                  setRiderAssignments((prev) => ({
                                    ...prev,
                                    [order.id]: e.target.value,
                                  }))
                                }
                                className="w-full appearance-none px-4 py-3 text-sm bg-white border border-green-200 
                                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                         focus:border-green-500 transition-all pr-10"
                              >
                                <option value="">Select Rider</option>
                                {ridersLoading && <option disabled>Loading riders...</option>}
                                {riders.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name} ({r.phone})
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <button
                              onClick={() => handleAssignRider(order.id)}
                              disabled={!riderAssignments[order.id]}
                              className="w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-xl
                                       hover:bg-green-700 active:bg-green-800 transition-colors
                                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600
                                       focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:ring-offset-2"
                            >
                              Confirm Rider Assignment
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between gap-4">
              {/* Previous Button */}
              <button
                onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 
                         bg-white border border-gray-200 rounded-xl hover:bg-gray-50 
                         transition-all disabled:opacity-40 disabled:cursor-not-allowed 
                         disabled:hover:bg-white focus:outline-none focus:ring-2 
                         focus:ring-green-500/20"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Previous</span>
              </button>

              {/* Page Info */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page <span className="font-semibold text-gray-900">{page}</span> of{" "}
                  <span className="font-semibold text-gray-900">{totalPages}</span>
                </span>
              </div>

              {/* Next Button */}
              <button
                onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 
                         bg-white border border-gray-200 rounded-xl hover:bg-gray-50 
                         transition-all disabled:opacity-40 disabled:cursor-not-allowed 
                         disabled:hover:bg-white focus:outline-none focus:ring-2 
                         focus:ring-green-500/20"
              >
                <span className="hidden xs:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Results Info */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Showing {orders.length} of {count} orders
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Modals */}
    {selectedOrder && (
      <OrderDetailModal 
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    )}

    {modalOrder && (modalStatus || modalPaymentStatus) && (
      <StatusModal
        order={modalOrder}
        newStatus={modalStatus}
        newPaymentStatus={modalPaymentStatus}
        onClose={() => {
          setModalOrder(null);
          setModalStatus(null);
          setModalPaymentStatus(null);
          setRiderAssignments({});
        }}
        onConfirm={handleModalConfirm}
      />
    )}
  </div>
);
}