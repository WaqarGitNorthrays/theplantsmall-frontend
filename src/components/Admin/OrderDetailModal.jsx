// src/components/admin/OrderDetailModal.jsx
import { X } from "lucide-react";

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

export default function OrderDetailModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Order Details – {order.order_number}
        </h3>

        <div className="space-y-4 text-sm">
          <p>
            <span className="font-medium">Salesman:</span>{" "}
            {order.order_taker_name}
          </p>
          <p>
            <span className="font-medium">Shop:</span> {order.shop_name}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            {ORDER_STATUS[order.status]}
          </p>
          <p>
            <span className="font-medium">Payment:</span>{" "}
            {PAYMENT_STATUS[order.payment_status]}
          </p>
          <p>
            <span className="font-medium">Total:</span> Rs.{" "}
            {Number(order.total_amount).toLocaleString()}
          </p>

          {/* Products */}
          <div>
            <h4 className="font-medium mb-2">Products</h4>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between bg-gray-50 p-2 rounded"
                >
                  <span>
                    {item.product_name} ({item.cotton_packing_unit})
                  </span>
                  <span>
                    {item.quantity} × Rs.{item.unit_price}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Voice Notes */}
          {order.voice_notes?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Voice Notes</h4>
              <ul className="space-y-2">
                {order.voice_notes.map((note) => (
                  <li key={note.id}>
                    <audio
                      controls
                      src={note.voice_file}
                      className="w-full"
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
  );
}
