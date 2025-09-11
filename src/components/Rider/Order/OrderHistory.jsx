import React from "react";
import { useSelector } from "react-redux";
import { Clock, Mic } from "lucide-react";

const OrderHistory = ({ shopId }) => {
  const orders = useSelector((state) =>
    state.orders.orders.filter((o) => o.shopId === shopId)
  );

  if (orders.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-600 text-sm sm:text-base">
        No previous orders for this shop.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
            <h4 className="font-semibold text-gray-900 text-base sm:text-lg">
              Order #{order.id}
            </h4>
            <span
              className={`text-xs sm:text-sm font-medium px-3 py-1 rounded-full w-max ${
                order.status === "ready"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* Items (if any) */}
          {order.items?.length > 0 && (
            <ul className="text-sm text-gray-700 mb-3 space-y-1">
              {order.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    Rs {item.price.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* 🎤 Voice Notes */}
          {order.voiceNotes?.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-gray-800 flex items-center mb-2">
                <Mic className="h-4 w-4 mr-1 text-green-600" /> Voice Notes
              </h5>
              <div className="space-y-2">
                {order.voiceNotes.map((note, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <audio
                      controls
                      src={note}
                      className="w-full h-8 sm:h-10"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-2 mt-2">
            <span className="font-medium text-gray-800">
              Total: Rs {order.totalAmount.toFixed(2)}
            </span>
            <span className="flex items-center text-xs sm:text-sm">
              <Clock className="inline h-4 w-4 mr-1 text-gray-500" />
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
