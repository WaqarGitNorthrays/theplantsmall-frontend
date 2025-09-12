import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Clock, Mic } from "lucide-react";
import { fetchOrders } from "../../../store/slices/ordersSlice";

const OrderHistory = ({ shopId }) => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const filteredOrders = orders.filter((o) => String(o.shop) === String(shopId));

  if (loading) return <div className="p-4 text-center text-gray-600">⏳ Loading orders...</div>;
  if (error) return <div className="p-4 text-center text-red-600">❌ Failed to load orders: {error}</div>;
  if (filteredOrders.length === 0) return <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-600 text-sm sm:text-base">No previous orders for this shop.</div>;

  return (
    <div className="space-y-4">
      {filteredOrders.map((order) => (
        <div key={order.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
            <h4 className="font-semibold text-gray-900 text-base sm:text-lg">
              Order #{order.order_number || order.id}
            </h4>
            <span className={`text-xs sm:text-sm font-medium px-3 py-1 rounded-full w-max ${order.status === "ready" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {order.status || "pending"}
            </span>
          </div>

          {/* Items */}
          {order.items?.length > 0 && (
            <ul className="text-sm text-gray-700 mb-3 space-y-1">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                  <span>{item.quantity} × {item.product_name}</span>
                  <span className="font-medium text-gray-900">
                    Rs {parseFloat(item.unit_price || item.cotton_price || 0).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Voice Notes */}
          {order.voice_notes?.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-gray-800 flex items-center mb-2">
                <Mic className="h-4 w-4 mr-1 text-green-600" /> Voice Notes
              </h5>
              <div className="space-y-2">
                {order.voice_notes.map((note, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <audio controls src={note} className="w-full h-8 sm:h-10" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-2 mt-2">
            <span className="font-medium text-gray-800">
              Total: Rs {parseFloat(order.total_amount || order.total || 0).toFixed(2)}
            </span>
            <span className="flex items-center text-xs sm:text-sm">
              <Clock className="inline h-4 w-4 mr-1 text-gray-500" />
              {new Date(order.created_at || order.createdAt).toLocaleString()}
            </span>
          </div>

        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
