import {
  X,
  ShoppingBag,
  Mic,
  Tag,
  Clock,
  CircleDollarSign,
  User,
  Store,
} from "lucide-react";
import moment from "moment";

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

// Function to get a badge color based on status
const getStatusBadge = (status) => {
  switch (status) {
    case "confirmed":
    case "delivered":
    case "paid":
      return "bg-emerald-100 text-emerald-800";
    case "pending":
    case "preparing":
    case "unpaid":
      return "bg-amber-100 text-amber-800";
    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function OrderDetailModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 sm:p-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 md:p-8 relative transform transition-all scale-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="h-6 w-6" />
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Order: <span className="text-gray-600 font-normal">{order.order_number}</span>
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Placed on {moment(order.created_at).format("MMMM D, YYYY [at] h:mm A")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 gap-x-12">
          {/* Left Column: General Details */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <Tag size={20} className="text-gray-500" /> Order Summary
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium">Salesman:</span>
                </div>
                <span className="text-gray-700">{order.order_taker_name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-gray-400" />
                  <span className="font-medium">Shop:</span>
                </div>
                <span className="text-gray-700">{order.shop_name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="font-medium">Status:</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {ORDER_STATUS[order.status]}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <CircleDollarSign size={16} className="text-gray-400" />
                  <span className="font-medium">Payment:</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                    order.payment_status
                  )}`}
                >
                  {PAYMENT_STATUS[order.payment_status]}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-base mt-4 pt-2 border-t border-gray-300">
                <span>Total Amount:</span>
                <span>Rs. {Number(order.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Products and Voice Notes */}
          <div className="space-y-6">
            {/* Products Section */}
            <div>
              <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
                <ShoppingBag size={20} className="text-gray-500" /> Products
              </h4>
              <ul className="space-y-2">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {item.product_name}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.cotton_packing_unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-700 font-medium">
                        {item.quantity} × Rs.{item.unit_price}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-t border-gray-200" />

            {/* Voice Notes Section */}
            {order.voice_notes?.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
                  <Mic size={20} className="text-gray-500" /> Voice Notes
                </h4>
                <ul className="space-y-4">
                  {order.voice_notes.map((note) => (
                    <li key={note.id}>
                      <audio
                        controls
                        src={note.voice_file}
                        className="w-full rounded-md shadow-sm"
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}