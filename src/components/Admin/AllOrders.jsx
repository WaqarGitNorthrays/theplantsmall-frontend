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
  Tag,
  User,
  Store,
  CreditCard,
  Hash,
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

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ClipboardList className="h-6 w-6" /> All Orders
        </h2>
      </div>

      {/* Search + Filters */}
      <div className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between border-b border-gray-200 bg-gray-50">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, shop, or salesman..."
            value={searchTerm}
            onChange={(e) => {
              dispatch(setPage(1));
              setSearchTerm(e.target.value);
            }}
            className="pl-10 pr-4 py-2 w-full border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                dispatch(setPage(1));
                setStatusFilter(e.target.value);
              }}
              className="w-full sm:w-auto border-2 border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
            >
              <option value="">All Status</option>
              {Object.entries(ORDER_STATUS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(e) => {
                dispatch(setPage(1));
                setPaymentFilter(e.target.value);
              }}
              className="w-full sm:w-auto border-2 border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
            >
              <option value="">All Payments</option>
              {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>         
          {/* Date range */}
              <input
                type={startDate ? "date" : "text"}
                placeholder="Start Date (MM/DD/YYYY)"
                value={startDate}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                onChange={(e) => {
                  dispatch(setPage(1));
                  setStartDate(e.target.value);
                }}
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />

              <input
                type={endDate ? "date" : "text"}
                placeholder="End Date (MM/DD/YYYY)"
                value={endDate}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                onChange={(e) => {
                  dispatch(setPage(1));
                  setEndDate(e.target.value);
                }}
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden md:block">
        {loading && <p className="p-6 text-gray-500">Loading orders…</p>}
        {error && <p className="p-6 text-red-500">Error: {error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="p-6 text-gray-500">No orders found.</p>
        )}

        {orders.length > 0 && (
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">Order No</th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">Salesman</th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">Shop</th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">Products</th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">Payment</th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">Total</th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
                    className="hover:bg-emerald-50 cursor-pointer transition"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {order.order_taker_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {order.shop_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {productsPreview}
                      {moreCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order, e.target.value);
                          }}
                          className={`
                            px-4 py-1 text-xs font-semibold rounded-full
                            ${getStatusColor(order.status)}
                            border border-transparent
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                            appearance-none pr-8
                          `}
                        >
                          {Object.entries(ORDER_STATUS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-700">
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={order.payment_status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handlePaymentStatusChange(order, e.target.value);
                          }}
                          className={`
                            px-4 py-1 text-xs font-semibold rounded-full
                            ${getPaymentColor(order.payment_status)}
                            border border-transparent
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                            appearance-none pr-8
                          `}
                        >
                          {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-700">
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      Rs. {Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Card View with Accordion */}
      <div className="md:hidden">
        {loading && <p className="p-6 text-gray-500">Loading orders…</p>}
        {error && <p className="p-6 text-red-500">Error: {error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="p-6 text-gray-500">No orders found.</p>
        )}
        
        {orders.length > 0 && orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;

          return (
            <div
              key={order.id}
              className={`border-b border-gray-200 transition-all duration-300 ${isExpanded ? 'bg-emerald-50' : 'bg-white'}`}
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-lg text-gray-900">#{order.order_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs text-nowrap font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {ORDER_STATUS[order.status]}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 pt-0 space-y-3 bg-white">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-500" />
                    <span><span className="font-semibold">Salesman:</span> {order.order_taker_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Store className="w-4 h-4 text-gray-500" />
                    <span><span className="font-semibold">Shop:</span> {order.shop_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span><span className="font-semibold">Payment:</span> {PAYMENT_STATUS[order.payment_status]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span><span className="font-semibold">Total:</span> <span className="text-green-600 font-bold">Rs. {Number(order.total_amount).toLocaleString()}</span></span>
                  </div>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Products</h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between p-2 bg-gray-50 rounded-md">
                          <span>{item.product_name} x {item.quantity}</span>
                          <span>Rs. {Number(item.unit_price).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <label htmlFor={`status-select-mobile-${order.id}`} className="block text-sm font-semibold text-gray-800 mb-1">
                      Update Status:
                    </label>
                    <div className="relative">
                      <select
                        id={`status-select-mobile-${order.id}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                        className={`
                          w-full px-4 py-2 text-sm rounded-lg border-2 border-gray-300 shadow-sm
                          bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500
                          pr-8 transition-colors
                        `}
                      >
                        {Object.entries(ORDER_STATUS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor={`payment-status-select-mobile-${order.id}`} className="block text-sm font-semibold text-gray-800 mb-1">
                      Update Payment Status:
                    </label>
                    <div className="relative">
                      <select
                        id={`payment-status-select-mobile-${order.id}`}
                        value={order.payment_status}
                        onChange={(e) => handlePaymentStatusChange(order, e.target.value)}
                        className={`
                          w-full px-4 py-2 text-sm rounded-lg border-2 border-gray-300 shadow-sm
                          bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500
                          pr-8 transition-colors
                        `}
                      >
                        {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Rider Assignment for Mobile View */}
                  {riderAssignments[order.id] !== undefined && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Assign Rider:
                      </label>
                      <div className="relative">
                        <select
                          value={riderAssignments[order.id]}
                          onChange={(e) =>
                            setRiderAssignments((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 text-sm rounded-lg border-2 border-gray-300 shadow-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
                        >
                          <option value="">Select Rider</option>
                          {ridersLoading && <option disabled>Loading riders...</option>}
                          {riders.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.phone})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignRider(order.id)}
                        disabled={!riderAssignments[order.id]}
                        className="mt-3 w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
            disabled={page === 1}
            className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-emerald-100 transition disabled:opacity-50"
          >
            ⬅ Previous
          </button>
          <span className="text-sm text-gray-700 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-emerald-100 transition disabled:opacity-50"
          >
            Next ➡
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Status Modal */}
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