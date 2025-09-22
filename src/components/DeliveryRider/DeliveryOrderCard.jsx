import { useState } from "react";
import { Tag, DollarSign, Store, Calendar, Package } from "lucide-react";
import { ORDER_STATUS, PAYMENT_STATUS } from "./DeliveryRiderDashboard.constants";

export default function DeliveryOrderCard({ order, onUpdate }) {
  // Only allow 'ready' and 'delivered' as local status
  const [localStatus, setLocalStatus] = useState(order.status === "delivered" ? "delivered" : "ready");
  const [localPayment, setLocalPayment] = useState(order.payment_status || "unpaid");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (localStatus !== "delivered") return;
    setSubmitting(true);
    await onUpdate(order.id, {
      status: "delivered",
      payment_status: localPayment,
    });
    setSubmitting(false);
  };

  return (
    <div className="border-2 border-transparent rounded-xl p-6 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 text-lg">
          Order #{order.order_number}
        </h4>
        <span
          className={`px-3 py-1 rounded-full text-xs text-nowrap font-semibold w-max ${getStatusColor(localStatus)}`}
        >
          {ORDER_STATUS[localStatus] || localStatus}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-gray-400" />
          <span>{order.shop_name || "N/A"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(order.created_at).toLocaleString()}</span>
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
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-auto">
            <Tag className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={localStatus}
            onChange={(e) => {
              const val = e.target.value;
              // Only allow 'ready' and 'delivered', ignore empty
              if (val === "ready" || val === "delivered") {
                setLocalStatus(val);
              }
            }}
            className="block w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg bg-gray-50 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          >
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <label className="block text-sm font-semibold text-gray-800">
          Update Payment Status:
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {/* <DollarSign className="h-5 w-5 text-gray-400" /> */}
          </div>
          <select
            value={localPayment}
            onChange={(e) => setLocalPayment(e.target.value)}
            className="block w-full px-4 py-2 pl-4 border border-gray-300 rounded-lg bg-gray-50 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          >
            <option value="">Select Payment Status</option>
            {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          onClick={handleSubmit}
          disabled={submitting || localStatus !== "delivered" || !localPayment}
        >
          {submitting ? "Delivering..." : "Deliver Order"}
        </button>
      </div>
    </div>
  );
}
