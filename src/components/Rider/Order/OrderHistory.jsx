import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Clock, Mic, Tag } from "lucide-react";
import { fetchOrders, setPage } from "../../../store/slices/ordersSlice";

const OrderHistory = ({ shopId }) => {
  const dispatch = useDispatch();
  const { orders, loading, error, page, next } = useSelector(
    (state) => state.orders
  );

  const [audioUrls, setAudioUrls] = useState({}); // store blob URLs per order

  // Load first page when component mounts
  useEffect(() => {
    dispatch(fetchOrders({ page: 1, shop_id: shopId }));
  }, [dispatch, shopId]);

  // Generate URLs for voice notes
  useEffect(() => {
    const newUrls = {};
    orders.forEach((order) => {
      if (order.voice_notes?.length > 0) {
        newUrls[order.id] = order.voice_notes
          .map((note) => {
            try {
              // Handle object with voice_file (backend URL)
              if (note && typeof note === "object" && note.voice_file && typeof note.voice_file === "string") {
                return note.voice_file;
              }
              // Handle string URLs (for backward compatibility)
              if (typeof note === "string" && note.trim() !== "") {
                return note;
              }
              // Handle objects with url or blob (for backward compatibility)
              if (note && typeof note === "object") {
                if (note.url && typeof note.url === "string") {
                  return note.url;
                }
                if (note.blob instanceof Blob) {
                  return URL.createObjectURL(note.blob);
                }
              }
              return null; // Invalid note
            } catch (err) {
              console.error(`Error processing voice note for order ${order.id}:`, err);
              return null;
            }
          })
          .filter((url) => url !== null); // Remove invalid URLs
      }
    });
    setAudioUrls(newUrls);

    // Cleanup: revoke blob URLs on unmount
    return () => {
      Object.values(newUrls).forEach((urls) => {
        urls.forEach((u) => {
          if (u?.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(u);
            } catch (err) {
              console.error("Error revoking blob URL:", err);
            }
          }
        });
      });
    };
  }, [orders]);

  const filteredOrders = orders.filter((o) => String(o.shop) === String(shopId));

  const handleLoadMore = () => {
    if (next) {
      dispatch(setPage(page + 1));
      dispatch(fetchOrders({ page: page + 1, shop_id: shopId }));
    }
  };

  if (loading && page === 1)
    return (
      <div className="p-4 text-center text-gray-600 animate-pulse">
        <p>Loading orders...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
        Failed to load orders: {error}
      </div>
    );

  if (filteredOrders.length === 0 && !loading)
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm text-center text-gray-600 font-medium">
        No previous orders for this shop.
      </div>
    );

  return (
    <div className="relative">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h4 className="font-bold text-gray-900 text-lg sm:text-xl">
                Order #{order.order_number || order.id}
              </h4>
              <span
                className={`text-xs sm:text-sm font-semibold px-4 py-1 rounded-full w-max 
                  ${
                    order.status === "ready"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {order.status || "pending"}
              </span>
            </div>

            {/* Items */}
            {order.items?.length > 0 && (
              <div className="mb-4">
                <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-green-600" />
                  Items
                </h5>
                <ul className="text-sm text-gray-700 space-y-2">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3"
                    >
                      <span>
                        {item.quantity} × {item.product_name}
                      </span>
                      <span className="font-medium text-gray-900">
                        Rs{" "}
                        {parseFloat(
                          item.unit_price || item.cotton_price || 0
                        ).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Voice Notes */}
            {order.voice_notes?.length > 0 && audioUrls[order.id]?.length > 0 && (
              <div className="mb-4">
                <h5 className="font-semibold text-gray-800 flex items-center mb-2">
                  <Mic className="h-4 w-4 mr-2 text-green-600" /> Voice Notes
                </h5>
                <div className="space-y-2">
                  {audioUrls[order.id].map((url, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <audio controls src={url} className="w-full h-8 sm:h-10">
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2 border-t pt-4 mt-4 border-gray-200">
              <span className="font-bold text-green-700 text-base">
                Total: Rs{" "}
                {parseFloat(order.total_amount || order.total || 0).toFixed(2)}
              </span>
              <span className="flex items-center text-xs sm:text-sm text-gray-500">
                <Clock className="inline h-4 w-4 mr-1" />
                {new Date(order.created_at || order.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {next && (
        <div className="bottom-0 left-0 right-0 py-3 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 text-green-800 font-bold rounded-lg shadow hover:bg-green-700 hover:text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;