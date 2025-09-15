// src/components/orders/OrderTaking.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../../../store/slices/productsSlice";
import { submitorder } from "../../../store/slices/ordersSlice";
import { formatAddress } from "../../../utils/formatAddress.js";
import OrderHistory from "./OrderHistory";
import { Plus, Mic, MessageSquare, Store, Trash2, X } from "lucide-react";
import { toast } from 'react-toastify';
import GpsCapture from "../GpsCapture.jsx";
import "../../../assets/css/OrderTaking.css";
import api from "../../../utils/axiosInstance.js";


const OrderTaking = ({ shopId }) => {
  const dispatch = useDispatch();
  const shops = useSelector((state) => state.shops.shops);

  // ✅ products state from Redux
  const { products, loading: productsLoading, error: productsError } =
    useSelector((state) => state.products);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const [view, setView] = useState("new");
  const [orderItems, setOrderItems] = useState([]);
  const [inputType, setInputType] = useState("text");
  const [voiceOrderParsed, setVoiceOrderParsed] = useState([]); // parsed items from speech-to-text
  const [voiceProcessing, setVoiceProcessing] = useState(false); // loading state

  const [newItem, setNewItem] = useState({
    productId: "",
    name: "",
    quantity: 1,
    price: 0,
    size: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCotton, setSelectedCotton] = useState(null);
  const [minPrice, setMinPrice] = useState(0);

  const [voiceNotes, setVoiceNotes] = useState([]);
  const [extraVoiceNotes, setExtraVoiceNotes] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isExtraRecording, setIsExtraRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const mediaRecorderExtraRef = useRef(null);
  const chunksExtraRef = useRef([]);

  const [gpsData, setGpsData] = useState(null); // unified GPS
  const user = useSelector((state) => state.auth.user);
  const order_taker = user?.id;

const { nearbyShops } = useSelector((state) => state.shops);
const selectedShop = nearbyShops.find((shop) => String(shop.id) === String(shopId));


   const handleLocationCaptured = (loc) => {
    setGpsData(loc);
  };

  // --- handlers ---
  const handleProductChange = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    setSelectedProduct(product);
    setSelectedCotton(null);
    setMinPrice(0);

    setNewItem({
      productId,
      name: product.name,
      quantity: 1,
      price: parseFloat(product.discount_price),
      size: "",
    });
  };

  const handleSizeChange = (cottonId) => {
    if (!selectedProduct) return;

    const cotton = selectedProduct.cottons.find(
      (c) => c.id === parseInt(cottonId)
    );
    setSelectedCotton(cotton);

    const cottonPrice =
      parseFloat(cotton.price) > 0
        ? parseFloat(cotton.price)
        : parseFloat(selectedProduct.discount_price);

    setMinPrice(cottonPrice);

    setNewItem((prev) => ({
      ...prev,
      size: cotton.packing_unit,
      price: cottonPrice,
    }));
  };

  const handleQuantityChange = (qty) => {
    setNewItem((prev) => ({
      ...prev,
      quantity: parseInt(qty),
    }));
  };

  const handlePriceChange = (price) => {
    const parsed = parseFloat(price);
    if (isNaN(parsed)) return;
    // enforce minimum price
    if (parsed < minPrice) {
      setNewItem((prev) => ({ ...prev, price: minPrice }));
    } else {
      setNewItem((prev) => ({ ...prev, price: parsed }));
    }
  };

  const addOrderItem = () => {
    if (selectedProduct && selectedCotton && newItem.quantity > 0) {
      setOrderItems([
        ...orderItems,
        {
          ...newItem,
          id: Date.now(),
          cottonId: selectedCotton?.id || null,
          minPrice,
        },
      ]);
      setNewItem({
        productId: "",
        name: "",
        quantity: 1,
        price: 0,
        size: "",
      });
      setSelectedProduct(null);
      setSelectedCotton(null);
      setMinPrice(0);
    } else {
      alert("⚠️ Please select product, size and quantity");
    }
  };

  // ❌ Remove item
  const removeOrderItem = (itemId) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId));
  };

  // 💰 Calculate total
  const getTotalAmount = () =>
    orderItems.reduce((total, item) => total + item.quantity * item.price, 0);

  // 🎤 Start recording (for main order)
const startRecording = async () => {
  if (inputType === "voice" && voiceNotes.length >= 1) {
    alert("⚠️ Only one voice note is allowed for voice orders.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Specify mimeType as audio/webm;codecs=opus
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    chunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/mpeg' }); // rename as MP3
      const url = URL.createObjectURL(blob);
      setVoiceNotes([{ url, blob }]);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  } catch (err) {
    console.error("❌ Mic error:", err);
    alert("Microphone access failed. Please allow permission.");
  }
};


  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeVoiceNote = (index) => {
    setVoiceNotes((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  // 🎤 Extra voice notes (separate)
  const startExtraRecording = async () => {
     if (extraVoiceNotes.length >= 1) {
    alert("⚠️ Only one extra voice note is allowed.");
    return;
  }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderExtraRef.current = new MediaRecorder(stream);
      chunksExtraRef.current = [];

      mediaRecorderExtraRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksExtraRef.current.push(e.data);
      };

      mediaRecorderExtraRef.current.onstop = () => {
        const blob = new Blob(chunksExtraRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setExtraVoiceNotes((prev) => [...prev, { url, blob }]);
      };

      mediaRecorderExtraRef.current.start();
      setIsExtraRecording(true);
    } catch (err) {
      console.error("❌ Mic error:", err);
      alert("Microphone access failed. Please allow permission.");
    }
  };

  const stopExtraRecording = () => {
    if (mediaRecorderExtraRef.current) {
      mediaRecorderExtraRef.current.stop();
      setIsExtraRecording(false);
    }
  };

  const removeExtraVoiceNote = (index) => {
    setExtraVoiceNotes((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };


const handleSubmitVoiceOrder = async () => {
  if (voiceNotes.length === 0) return;

  setVoiceProcessing(true);

  try {
    const formData = new FormData();
    formData.append("file", voiceNotes[0].blob, "voice-order.mp3");

    const res = await api.post("/plants-mall-orders/api/orders/speech-to-text/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = res.data; // ✅ Axios already parses JSON
    console.log("Speech-to-text response:", data);

    // Map API response to your order item format
    const parsedItems = (data.results || []).map((item, idx) => ({
      id: Date.now() + idx,
      productId: item.product, 
      name: item.product_name,
      quantity: parseInt(item.quantity || 0),
      discount_price: parseFloat(item.discount_price || 0), 
      price: parseFloat(item.price || 0), 
      size: item.carton_packing_unit || "-",
      
    }));

    setVoiceOrderParsed(parsedItems);
    toast.success("Voice order parsed successfully!");
  } catch (err) {
    console.error("Voice order parsing failed:", err);
    toast.error("Failed to process voice order. Please try again.");
  } finally {
    setVoiceProcessing(false);
  }
};


  // Submit order
const handleSubmitOrder = async () => {
  if (!shopId || !selectedShop) {
    toast.error("⚠️ No shop found. Please go back and select a shop.");
    return;
  }

  if (!gpsData || gpsData.status !== "ready") {
    toast.error("Please capture your location before submitting the order.");
    return;
  }

  const formData = new FormData();
  formData.append("shop", selectedShop.id);
  formData.append("order_taker", order_taker);

  if (inputType === "text") {
    if (orderItems.length === 0) {
      toast.error("Please add at least one item for text orders.");
      return;
    }

    formData.append(
      "items_data",
      JSON.stringify(
        orderItems.map((item) => ({
          product: item.productId ? parseInt(item.productId) : null,
          product_name: item.name,
          cotton: item.cottonId,
          cotton_packing_unit: item.size,
          cotton_price: item.minPrice.toFixed(2),
          quantity: item.quantity,
          unit_price: item.price.toFixed(2),
        }))
      )
    );

    voiceNotes.forEach((note) => formData.append("voice_notes", note.blob));
    extraVoiceNotes.forEach((note) => formData.append("voice_notes", note.blob));
  } else if (inputType === "voice") {
  if (voiceOrderParsed.length === 0) {
    toast.error("Please submit and parse your voice order first.");
    return;
  }

  formData.append(
    "items_data",
    JSON.stringify(
      voiceOrderParsed.map((item) => ({
        product: item.productId ? parseInt(item.productId) : null,
        product_name: item.name,
        cotton: null,
        cotton_packing_unit: item.size,
        cotton_price: item.price.toFixed(2),
        quantity: item.quantity,
        unit_price: item.price.toFixed(2),
        // is_voice_order: true,
      }))
    )
  );

  voiceNotes.forEach((note) => formData.append("voice_notes_data", note.blob));
}


  formData.append(
    "location",
    JSON.stringify({
      lat: gpsData.lat,
      lng: gpsData.lng,
      accuracy: gpsData.accuracy,
    })
  );

  // ✅ Log payload for debugging
  console.log("Final Order Payload:");
  for (let [key, value] of formData.entries()) {
    console.log("   ", key, ":", value);
  }

  try {
    const response = await dispatch(submitorder(formData)).unwrap();
    console.log("Backend response:", response);

    toast.success("Order submitted successfully!");

    // Reset form
    setOrderItems([]);
    setNewItem({ productId: "", name: "", quantity: 1, price: 0, size: "" });
    setVoiceNotes([]);
    setExtraVoiceNotes([]);
     setVoiceOrderParsed([]);
  } catch (err) {
    console.error("Order submission failed:", err);

    // Display backend error message if exists, else default message
    const message =
      err?.message ||
      err?.non_field_errors?.[0] ||
      "Failed to submit order. Please try again.";
    toast.error(message);
  }
};


  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setView("new")}
          className={`px-4 py-2 text-sm font-medium ${
            view === "new"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Take New Order
        </button>
        <button
          onClick={() => setView("history")}
          className={`px-4 py-2 text-sm font-medium ${
            view === "history"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Order History
        </button>
      </div>

      {view === "new" ? (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Take New Order
            </h3>
            <div className="flex items-center space-x-2 bg-green-50 rounded-lg p-1">
              <button
                onClick={() => setInputType("text")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  inputType === "text"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-1" />
                Text
              </button>
              <button
                onClick={() => setInputType("voice")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  inputType === "voice"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Mic className="h-4 w-4 inline mr-1" />
                Voice
              </button>
            </div>
          </div>

          {/* Shop Info */}
          {selectedShop && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Store className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Selected Shop
                </span>
              </div>
              <p className="text-gray-800 font-semibold">{selectedShop.shop_name}</p>
              {selectedShop.shop_address && (
                <p className="text-sm text-gray-600">{formatAddress(selectedShop.shop_address)}</p>
              )}
              <div className="mt-2 text-sm text-gray-700">
                {selectedShop.owner_name && (
                  <p>
                    <span className="font-medium">Owner:</span>{" "}
                    {selectedShop.owner_name}
                  </p>
                )}
                {selectedShop.owner_phone && (
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedShop.owner_phone}
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Order Inputs */}
          {inputType === "text" && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              {/* ✅ Dropdowns for product & size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {/* Product Dropdown */}
                <select
                  value={newItem.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Product</option>
                  {productsLoading && <option>Loading...</option>}
                  {productsError && (
                    <option disabled>Error loading products</option>
                  )}
                  {!productsLoading &&
                    !productsError &&
                    products
                      .filter((p) => p.cottons && p.cottons.length > 0)
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                </select>

                {/* Size Dropdown */}
                <select
                  value={selectedCotton?.id || ""}
                  onChange={(e) => handleSizeChange(e.target.value)}
                  disabled={!selectedProduct}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Size</option>
                  {selectedProduct?.cottons.map((cotton) => (
                    <option key={cotton.id} value={cotton.id}>
                      {cotton.packing_unit}
                    </option>
                  ))}
                </select>

                {/* Quantity */}
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="Qty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />

                {/* Price (manual, min check) */}
                <input
                  type="number"
                  min={minPrice}
                  value={newItem.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="Price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />

                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-row sm:flex-row items-center justify-between p-4 bg-white rounded-lg border border-gray-200 gap-2"
                >
                  <div>
                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} • Size: {item.size || "-"} • Rs{" "}
                      {item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-auto">
                    <span className="font-semibold text-green-600">
                      Rs {(item.quantity * item.price).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeOrderItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="font-semibold text-gray-900">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-green-600">
                  Rs {getTotalAmount().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* 🔊 Extra Voice Notes (Optional) */}

          {inputType === "text" && (
              <div className="bg-yellow-50 rounded-xl p-4 space-y-4">
            <h4 className="text-md font-semibold text-yellow-800">
              Optional Extra Voice Note
            </h4>
            <button
              onClick={
                isExtraRecording ? stopExtraRecording : startExtraRecording
              }
              className={`flex items-center justify-center w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isExtraRecording
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
            >
              <Mic
                className={`h-4 w-4 mr-2 ${
                  isExtraRecording ? "animate-pulse" : ""
                }`}
              />
              <span>
                {isExtraRecording
                  ? "Stop Recording"
                  : "Record Extra Voice Note"}
              </span>
            </button>

            {extraVoiceNotes.length > 0 &&
              extraVoiceNotes.map((note, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <audio controls src={note.url} className="w-full mr-3" />
                  <button
                    onClick={() => removeExtraVoiceNote(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
          </div>
          )}

          {/* 🎙️ Main Voice Notes */}
          {inputType === "voice" && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center justify-center w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  isRecording
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                <Mic
                  className={`h-4 w-4 mr-2 ${
                    isRecording ? "animate-pulse" : ""
                  }`}
                />
                <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
              </button>

              {voiceNotes.length > 0 &&
                voiceNotes.map((note, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <audio controls src={note.url} className="w-full mr-3" />
                    <button
                      onClick={() => removeVoiceNote(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
            </div>
          )}

          {inputType === "voice" && voiceNotes.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handleSubmitVoiceOrder}
                disabled={voiceProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {voiceProcessing ? "Processing..." : "Submit Voice Order"}
              </button>
            </div>
          )}

            {voiceOrderParsed.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-gray-900">Parsed Voice Order</h4>
                {voiceOrderParsed.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <span>{item.name} × {item.quantity} ({item.size})</span>
                    <span>Rs {item.price.toFixed(2)}</span>
                  </div>
                ))}

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-green-600">
                    Rs {voiceOrderParsed.reduce((sum, i) => sum + i.quantity * i.price, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}




          {/* 📍 GPS Capture */}
          <GpsCapture onLocationCaptured={handleLocationCaptured} initialGps={gpsData} />

          {/* 📤 Submit Button */}
          <button
            onClick={handleSubmitOrder}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold mt-6"
          >
            Submit Order
          </button>
        </>
      ) : (
        <OrderHistory shopId={shopId} />
      )}
    </div>
  );
};

export default OrderTaking;
