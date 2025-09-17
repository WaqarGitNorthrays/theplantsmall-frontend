// src/components/admin/AllOrders.jsx
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchOrders,
  updateOrder,
  setPage,
} from "../../store/slices/ordersSlice";
import { ClipboardList, Search, ChevronDown, ChevronUp } from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";
import StatusModal from "./StatusModal";

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

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [modalOrder, setModalOrder] = useState(null);
  const [modalStatus, setModalStatus] = useState(null);

  const totalPages = Math.ceil(count / pageSize);
  
  // ✅ fetch orders
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
    } else {
      dispatch(updateOrder({ orderId: order.id, updates: { status: newStatus } }));
    }
  };

  const handleModalConfirm = (updates) => {
    if (modalOrder) {
      dispatch(updateOrder({ orderId: modalOrder.id, updates }));
    }
    setModalOrder(null);
    setModalStatus(null);
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
        <div className="relative flex-1 max-w-sm">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, shop, or salesman..."
            value={searchTerm}
            onChange={(e) => {
              dispatch(setPage(1));
              setSearchTerm(e.target.value);
            }}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              dispatch(setPage(1));
              setStatusFilter(e.target.value);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            {Object.entries(ORDER_STATUS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => {
              dispatch(setPage(1));
              setPaymentFilter(e.target.value);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Payments</option>
            {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              dispatch(setPage(1));
              setStartDate(e.target.value);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              dispatch(setPage(1));
              setEndDate(e.target.value);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-500"
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
          <table className="w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">
                  Order No
                </th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">
                  Salesman
                </th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">
                  Shop
                </th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">
                  Products
                </th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">
                  Payment
                </th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">
                  Total
                </th>
                <th className="px-6 py-3 text-left font-semibold text-emerald-700">
                  Date
                </th>
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
                      <select
                        value={order.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order, e.target.value);
                        }}
                        className="px-3 py-1 text-xs font-medium rounded-md border shadow-sm bg-white focus:ring-2 focus:ring-green-500"
                      >
                        {Object.entries(ORDER_STATUS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">{order.payment_status}</td>
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

      {/* Mobile Card View with Expandable Accordion */}
      <div className="md:hidden">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const productsPreview = order.items
            .map((item) => item.product_name)
            .slice(0, 2)
            .join(", ");
          const moreCount =
            order.items.length > 2 ? ` +${order.items.length - 2}` : "";

          return (
            <div
              key={order.id}
              className="border-b p-4 hover:bg-emerald-50 transition"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setExpandedOrderId(isExpanded ? null : order.id)
                }
              >
                <span className="font-bold text-emerald-700">
                  #{order.order_number}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>

              <p className="text-gray-700 mt-2">
                <span className="font-medium">Shop:</span> {order.shop_name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Salesman:</span>{" "}
                {order.order_taker_name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Payment:</span>{" "}
                {order.payment_status}
              </p>
              <p className="text-green-600 font-semibold">
                Rs. {Number(order.total_amount).toLocaleString()}
              </p>

              {/* Expandable section */}
              {isExpanded && (
                <div className="mt-3 space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Products:</span>
                  </p>
                  <ul className="pl-4 list-disc text-gray-700">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.product_name} × {item.quantity}
                      </li>
                    ))}
                  </ul>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Update Status:
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md border shadow-sm bg-white focus:ring-2 focus:ring-green-500"
                    >
                      {Object.entries(ORDER_STATUS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
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
      {modalOrder && modalStatus && (
        <StatusModal
          order={modalOrder}
          newStatus={modalStatus}
          onClose={() => {
            setModalOrder(null);
            setModalStatus(null);
          }}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
}
