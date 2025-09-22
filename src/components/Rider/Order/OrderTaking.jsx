// src/components/orders/OrderTaking.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../../../store/slices/productsSlice";
import { submitorder } from "../../../store/slices/ordersSlice";
import { formatAddress } from "../../../utils/formatAddress.js";
import OrderHistory from "./OrderHistory";
import {
  Plus,
  Mic,
  MessageSquare,
  Store,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import GpsCapture from "../GpsCapture.jsx";
import api from "../../../utils/axiosInstance.js";

const OrderTaking = ({ shopId, onBack, onOrderSuccess }) => {
  // State for unavailable products from voice parsing
  const [unavailableVoiceItems, setUnavailableVoiceItems] = useState([]);
  // ...existing code...
  // Move auto-parse useEffect below state declarations
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
    quantity: null,
    price: null,
    size: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCotton, setSelectedCotton] = useState(null);
  const [minPrice, setMinPrice] = useState(0);

  const [voiceNotes, setVoiceNotes] = useState([]);
  const [extraVoiceNotes, setExtraVoiceNotes] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isExtraRecording, setIsExtraRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);


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

  // Auto-parse voice order once recording finishes and a note is available
  useEffect(() => {
    if (inputType === "voice" && voiceNotes.length > 0 && !voiceProcessing) {
      console.log("Auto-parsing triggered");
      handleSubmitVoiceOrder();
    }
  }, [voiceNotes, inputType]);

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
      toast.error("Please select product, size and quantity");
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
      toast.error("⚠️ Only one voice note is allowed for voice orders.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Specify mimeType as audio/webm;codecs=opus
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/mpeg" }); // rename as MP3
        const url = URL.createObjectURL(blob);
        setVoiceNotes([{ url, blob }]);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("❌ Mic error:", err);
      toast.error("Microphone access failed. Please allow permission.");
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
      toast.error("⚠️ Only one extra voice note is allowed.");
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
      console.error("Mic error:", err);
      toast.error("Microphone access failed. Please allow permission.");
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

    const res = await api.post(
      "/plants-mall-orders/api/orders/speech-to-text/",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const data = res.data;
    console.log("Speech-to-text response:", data);

    const validItems = [];
    const unavailableItems = [];

    (data.results || []).forEach((item, idx) => {
      if (item.product && !item.message) {
        // ✅ Valid product
        validItems.push({
          id: Date.now() + idx,
          productId: item.product,
          name: item.product_name,
          quantity: parseInt(item.quantity || 0),
          price: parseFloat(item.price || 0),
          discount_price: parseFloat(item.discount_price || 0),
          size: item.carton_packing_unit || "-",
        });
      } else if (!item.product && item.message) {
        // ❌ Product not available
        unavailableItems.push({
          id: Date.now() + idx,
          name: item.product_name || "Unknown Product",
          message: item.message,
        });
      }
    });

    setVoiceOrderParsed(validItems);
    setUnavailableVoiceItems(unavailableItems);

    if (validItems.length > 0) {
      toast.success("Voice order parsed successfully!");
      if (unavailableItems.length > 0) {
        toast.info("Some products are unavailable. Check messages below.");
      }
    } else {
      toast.error("Parsed error: No valid products found.");
    }
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
      toast.error("No shop found. Please go back and select a shop.");
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

formData.append("latitude", gpsData.lat ? gpsData.lat.toFixed(6) : "");
formData.append("longitude", gpsData.lng ? gpsData.lng.toFixed(6) : "");
formData.append("accuracy", gpsData.accuracy ? gpsData.accuracy.toString() : "");

    // ✅ Log payload for debugging
    console.log("Final Order Payload:");
    for (let [key, value] of formData.entries()) {
      console.log("   ", key, ":", value);
    }

    try {
      setSubmitting(true); // start loader
      const response = await dispatch(submitorder(formData)).unwrap();
      console.log("Backend response:", response);

      toast.success("Order submitted successfully!");

      // Reset form
      setOrderItems([]);
      setNewItem({ productId: "", name: "", quantity: 1, price: 0, size: "" });
      setVoiceNotes([]);
      setExtraVoiceNotes([]);
      setVoiceOrderParsed([]);

      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
  console.error("Order submission failed:", err);

  let message = "Failed to submit order. Please try again.";

  if (err?.cotton_packing_unit) {
    // Handle missing cotton stock error
    message = err.cotton_packing_unit;
  } else if (err?.message) {
    message = err.message;
  } else if (err?.non_field_errors?.length) {
    message = err.non_field_errors[0];
  } else if (typeof err === "string") {
    message = err;
  } else if (typeof err === "object") {
    // fallback for any key-based error object
    const firstKey = Object.keys(err)[0];
    if (firstKey && err[firstKey]) {
      message = Array.isArray(err[firstKey]) ? err[firstKey][0] : err[firstKey];
    }
  }

  toast.error(message);
}

  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-12 max-w-4xl mx-auto space-y-8">
      {/* Tabs */}
      <div className="flex space-x-2 border-b-2 border-gray-100">
        <button
          onClick={() => setView("new")}
          className={`px-4 py-3 text-sm font-semibold rounded-t-lg transition-all ${
            view === "new"
              ? "border-b-4 border-green-600 text-green-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Take New Order
        </button>
        <button
          onClick={() => setView("history")}
          className={`px-4 py-3 text-sm font-semibold rounded-t-lg transition-all ${
            view === "history"
              ? "border-b-4 border-green-600 text-green-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Order History
        </button>
      </div>

      {view === "new" ? (
        <>
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-xl font-bold text-gray-900">
                Create a New Order
              </h3>
              {/* Input Type Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => setInputType("text")}
                  className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    inputType === "text"
                      ? "bg-white text-green-600 shadow-md"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Text
                </button>
                <button
                  onClick={() => setInputType("voice")}
                  className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    inputType === "voice"
                      ? "bg-white text-green-600 shadow-md"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Voice
                </button>
              </div>
            </div>

            {/* Shop Info Card */}
            {selectedShop && (
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 shadow-sm flex items-start gap-4">
                <div className="bg-white p-3 rounded-lg flex items-center justify-center shadow-md">
                  <Store className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedShop.shop_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatAddress(selectedShop.shop_address)}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    {selectedShop.owner_name && (
                      <span>
                        Owner: <span className="font-medium">{selectedShop.owner_name}</span>
                      </span>
                    )}
                    {selectedShop.owner_phone && (
                      <span className="ml-4">
                        Phone: <span className="font-medium">{selectedShop.owner_phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Inputs */}
            {inputType === "text" && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800">Add Items</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Product Dropdown */}
                  <div className="relative">
                    <label htmlFor="product-select" className="sr-only">Product</label>
                    <select
                      id="product-select"
                      value={newItem.productId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 appearance-none bg-white transition-colors"
                    >
                      <option value="" disabled>
                        Select Product
                      </option>
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
                    {/* <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /> */}
                  </div>

                  {/* Size Dropdown */}
                  <div className="relative">
                    <label htmlFor="size-select" className="sr-only">Size</label>
                    <select
                      id="size-select"
                      value={selectedCotton?.id || ""}
                      onChange={(e) => handleSizeChange(e.target.value)}
                      disabled={!selectedProduct}
                      className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 appearance-none bg-white transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>
                        Select Size
                      </option>
                      {selectedProduct?.cottons.map((cotton) => (
                        <option key={cotton.id} value={cotton.id}>
                          {cotton.packing_unit}
                        </option>
                      ))}
                    </select>
                    {/* <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /> */}
                  </div>

                  {/* Quantity */}
                  <div className="relative">
                    <label htmlFor="quantity-input" className="sr-only">Quantity</label>
                    <input
                      id="quantity-input"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      placeholder="Quantity"
                      className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                    />
                    {/* <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /> */}
                  </div>

                  {/* Price (manual, min check) */}
                  <div className="relative">
                    <label htmlFor="price-input" className="sr-only">Price</label>
                    <input
                      id="price-input"
                      type="number"
                      min={minPrice}
                      value={newItem.price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="Price"
                      className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                    />
                    {/* <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /> */}
                  </div>
                </div>

                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center justify-center font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Item
                </button>
              </div>
            )}

            {/* Order Summary */}
            {(orderItems.length > 0 || voiceOrderParsed.length > 0) && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Order Summary</h4>
                <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
                  {inputType === "text" && orderItems.length > 0 && (
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {item.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              <span className="font-mono">
                                {item.quantity}
                              </span>{" "}
                              ×{" "}
                              <span className="font-mono">
                                Rs {item.price.toFixed(2)}
                              </span>{" "}
                              ({item.size})
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-green-600">
                              Rs {(item.quantity * item.price).toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeOrderItem(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg font-bold text-lg">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-green-700">Rs {getTotalAmount().toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {inputType === "voice" && voiceOrderParsed.length > 0 && (
                    <div className="space-y-2">
                      {voiceOrderParsed.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {item.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              <span className="font-mono">
                                {item.quantity}
                              </span>{" "}
                              ×{" "}
                              <span className="font-mono">
                                Rs {item.price.toFixed(2)}
                              </span>{" "}
                              ({item.size})
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-600">
                              Rs {(item.quantity * item.price).toFixed(2)}
                            </span>
                            <button
                              onClick={() => setVoiceOrderParsed((prev) => prev.filter((i) => i.id !== item.id))}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove item"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* Show unavailable products with message */}
                      {unavailableVoiceItems.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {unavailableVoiceItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                            >
                              <div>
                                <h5 className="font-medium text-red-700">
                                  {item.name}
                                </h5>
                                <p className="text-sm text-red-600">
                                  {item.message}
                                </p>
                              </div>
                              <button
                                onClick={() => setUnavailableVoiceItems((prev) => prev.filter((i) => i.id !== item.id))}
                                className="text-red-400 hover:text-red-700 p-1"
                                title="Dismiss message"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg font-bold text-lg">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-green-700">
                          Rs {voiceOrderParsed.reduce((sum, i) => sum + i.quantity * i.price, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Voice Notes Section */}
            {inputType === "voice" && (
              <div className="bg-green-100 rounded-xl p-6 space-y-4 border border-green-200">
                <h4 className="text-md font-semibold text-green-800">
                  Record Main Order
                </h4>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <Mic className="h-5 w-5 mr-2" />
                  <span>
                    {isRecording ? "Stop Recording..." : "Start Recording"}
                  </span>
                </button>
                {voiceNotes.length > 0 && (
                  <>
                    {voiceNotes.map((note, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <audio controls src={note.url} className="w-full mr-3" />
                        <button
                          onClick={() => removeVoiceNote(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    {voiceProcessing && (
                      <div className="flex items-center justify-center w-full py-4">
                        <svg className="animate-spin h-6 w-6 text-green-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span className="ml-2 text-green-600 font-semibold">Parsing voice order...</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {/* 🔊 Optional Extra Voice Notes */}
            {inputType === "text" && (
              <div className="bg-yellow-50 rounded-xl p-6 space-y-4 border border-yellow-200">
                <h4 className="text-md font-semibold text-yellow-800">
                  Optional Extra Voice Note
                </h4>
                <button
                  onClick={isExtraRecording ? stopExtraRecording : startExtraRecording}
                  className={`flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    isExtraRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-yellow-600 text-white hover:bg-yellow-700"
                  }`}
                >
                  <Mic className="h-5 w-5 mr-2" />
                  <span>
                    {isExtraRecording ? "Stop Recording..." : "Record Extra Note"}
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
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* 📍 GPS Capture */}
            <GpsCapture
              onLocationCaptured={handleLocationCaptured}
              initialGps={gpsData}
            />

            {/* 📤 Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={
                submitting ||
                (inputType === "text" && orderItems.length === 0) ||
                (inputType === "voice" && voiceOrderParsed.length === 0)
              }
              className={`w-full px-6 py-4 rounded-lg shadow-lg text-lg font-semibold mt-6 flex items-center justify-center transition-colors duration-200
                ${
                  submitting ||
                  (inputType === "text" && orderItems.length === 0) ||
                  (inputType === "voice" && voiceOrderParsed.length === 0)
                    ? "bg-gray-300 text-gray-500 border border-gray-400 cursor-not-allowed opacity-70"
                    : "bg-green-600 text-white hover:bg-green-700 border border-green-600"
                }`}
              style={{
                boxShadow:
                  submitting ||
                  (inputType === "text" && orderItems.length === 0) ||
                  (inputType === "voice" && voiceOrderParsed.length === 0)
                    ? "none"
                    : "0 4px 14px 0 rgba(34,197,94,0.15)",
              }}
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span className="text-white">Submitting Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 mr-3" />
                  Submit Order
                </>
              )}
            </button>

          </div>
        </>
      ) : (
        <OrderHistory shopId={shopId} />
      )}
    </div>
  );
};

export default OrderTaking;