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

if (loading && page === 1) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500">Loading orders...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="p-4">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-red-500 text-xl">⚠</span>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    </div>
  );
}

if (filteredOrders.length === 0 && !loading) {
  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">No Orders Yet</h3>
        <p className="text-sm text-gray-500">No previous orders for this shop</p>
      </div>
    </div>
  );
}

return (
  <div className="pb-6">
    <div className="space-y-3 px-3 sm:px-4">
      {filteredOrders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                  Order #{order.order_number || order.id}
                </h4>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                  order.status === "ready"
                    ? "bg-green-100 text-green-700"
                    : order.status === "delivered"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.status || "pending"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Items */}
            {order.items?.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Items ({order.items.length})
                </h5>
                <div className="space-y-2">
                  {order.items.map((item, idx) => {
                    const isCarton = item.cotton !== null;
                    const price = item.discount_price || item.unit_price || item.cotton_price || 0;
                    const total = parseFloat(price) * item.quantity;

                    return (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {item.quantity} × Rs {parseFloat(price).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                isCarton
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {isCarton ? "Carton" : "Loose"}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-bold text-gray-900 text-sm">
                            Rs {total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Voice Notes */}
            {order.voice_notes?.length > 0 && audioUrls[order.id]?.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Mic className="h-3 w-3" />
                  Voice Notes ({audioUrls[order.id].length})
                </h5>
                <div className="space-y-2">
                  {audioUrls[order.id].map((url, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-purple-50 rounded-xl border border-purple-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-purple-600">{idx + 1}</span>
                        </div>
                        <span className="text-xs text-gray-600">Audio Note</span>
                      </div>
                      <audio controls src={url} className="w-full h-10">
                        Your browser does not support audio.
                      </audio>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  {new Date(order.created_at || order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="font-bold text-green-600 text-base">
                  Rs {parseFloat(order.total_amount || order.total || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Load More Button */}
    {next && (
      <div className="px-3 sm:px-4 mt-4">
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
              Loading...
            </span>
          ) : (
            "Load More Orders"
          )}
        </button>
      </div>
    )}
  </div>
);
};

export default OrderHistory;