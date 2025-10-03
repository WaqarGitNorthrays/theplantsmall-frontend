// src/pages/orders/OrderReceipt.jsx
import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import Layout from "../../Layout/Layout";
import { useSelector } from "react-redux";

const OrderReceipt = () => {
  const { state } = useLocation();
  const receiptRef = useRef(null);
  const navigate = useNavigate();
  const reduxOrder = useSelector((s) => s.orders.lastOrder);
  const order = state?.order || reduxOrder;

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">No order found.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const downloadReceipt = async () => {
    const element = receiptRef.current;

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL("image/png");

    const padding = 60;
    const bgCanvas = document.createElement("canvas");
    bgCanvas.width = canvas.width + padding * 2;
    bgCanvas.height = canvas.height + padding * 2;

    const ctx = bgCanvas.getContext("2d");

    ctx.fillStyle = "#f3f4f6"; // soft bg
    ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    const img = new Image();
    img.src = imgData;
    await new Promise((res) => (img.onload = res));

    ctx.drawImage(img, padding, padding);

    const link = document.createElement("a");
    link.href = bgCanvas.toDataURL("image/png");
    link.download = `${order.order_number}-receipt.png`;
    link.click();
  };

  // --- Count cartons & loose items for summary ---
  const cartonCount = order.items.filter((i) => i.cotton !== null).length;
  const looseCount = order.items.filter((i) => i.loose !== null).length;

  return (
      <div className="gradient-bg min-h-screen py-6 px-2 sm:px-4">
        <div className="max-w-lg w-full mx-auto">
          {/* Success Header */}
          <div className="text-center mb-6 animate-slide-up">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-checkmark">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-1">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Your order has been successfully placed
            </p>
          </div>

          {/* Receipt */}
          <div
            ref={receiptRef}
            className="bg-white rounded-2xl shadow-md overflow-hidden animate-fade-in-up animate-delay-1 w-full break-words"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 md:p-8 w-full max-w-2xl mx-auto rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
                <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                    {order.shop_name}
                </h2>
                <p className="text-blue-100 text-sm sm:text-base">
                    Order Receipt
                </p>
                </div>
                <div className="text-left sm:text-right">
                <p className="text-blue-100 text-sm sm:text-base">Order #</p>
                <p className="font-mono text-sm sm:text-base">
                    {order.order_number}
                </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base">
                <div>
                <p className="text-blue-100">Salesman</p>
                <p className="font-semibold">{order.order_taker_name}</p>
                </div>
                <div className="text-left sm:text-right">
                <p className="text-blue-100">Date & Time</p>
                <p className="font-normal">
                    {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className="font-normal">
                    {new Date(order.created_at).toLocaleTimeString()}
                </p>
                </div>
            </div>
            </div>

            {/* Details */}
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-5 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-yellow-700 capitalize">
                    {order.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Payment</p>
                  <p className="font-semibold text-red-600 capitalize">
                    {order.payment_status}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                  Order Items
                </h3>

                <div className="space-y-2 sm:space-y-3">
                  {order.items.map((item, idx) => {
                    const isCarton = item.cotton !== null;
                    const price =
                      item.discount_price ||
                      item.unit_price ||
                      item.cotton_price ||
                      0;
                    const total = parseFloat(price) * item.quantity;

                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm sm:text-base">
                            {item.product_name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Qty: {item.quantity} × Rs{" "}
                            {parseFloat(price).toLocaleString()}
                          </p>
                          <div className="flex items-center mt-1 text-xs sm:text-sm">
                            {isCarton ? (
                              <>
                                <span className="text-blue-600 font-medium">
                                  Carton
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-green-600 font-medium">
                                  Loose
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">
                          Rs {total.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Summary row */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs sm:text-sm font-medium text-gray-700 flex justify-between">
                  <span>Cartons: {cartonCount}</span>
                  <span>Loose: {looseCount}</span>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-3 sm:pt-4 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-600 text-sm">Subtotal</p>
                  <p className="font-semibold text-sm sm:text-base">
                    Rs {parseFloat(order.subtotal).toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center text-base sm:text-lg font-bold text-gray-800 bg-blue-50 p-3 rounded-lg">
                  <p>Total Amount</p>
                  <p>Rs {parseFloat(order.total_amount).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3 animate-fade-in-up animate-delay-3">
            <button
               onClick={() => navigate(`/salesman-dashboard/shops/${order.shop}/order-taking`)}
              className="w-full bg-white text-blue-600 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Place New Order
            </button>

            <button
              onClick={downloadReceipt}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              Download Receipt
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 animate-fade-in-up animate-delay-3">
            <p className="text-gray-700 text-xs sm:text-sm">
              Thank you for your order!
            </p>
            <p className="text-gray-800 text-xs mt-1">
              Order ID: {order.order_id}
            </p>
          </div>
        </div>
      </div>
  );
};

export default OrderReceipt;
