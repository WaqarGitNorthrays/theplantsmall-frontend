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
  Package, ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import GpsCapture from "../GpsCapture.jsx";
import api from "../../../utils/axiosInstance.js";

const OrderTaking = ({ shopId, onBack, onOrderSuccess }) => {
  const dispatch = useDispatch();
  const shops = useSelector((state) => state.shops.shops);
  const { products, loading: productsLoading, error: productsError } = useSelector((state) => state.products);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const [view, setView] = useState("new");
  const [inputType, setInputType] = useState("text");
  const [orderItems, setOrderItems] = useState([]);
  const [voiceOrderParsed, setVoiceOrderParsed] = useState([]);
  const [unavailableVoiceItems, setUnavailableVoiceItems] = useState([]);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isExtraRecording, setIsExtraRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    productId: "",
    variantId: "",
    name: "",
    size: "",
    quantity: 1,
    price: "",
    is_carton: false,
    carton_id: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const navigate = useNavigate();

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mediaRecorderExtraRef = useRef(null);
  const chunksExtraRef = useRef([]);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [extraVoiceNotes, setExtraVoiceNotes] = useState([]);
  const [gpsData, setGpsData] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const order_taker = user?.id;
  const { nearbyShops } = useSelector((state) => state.shops);
  const selectedShop = nearbyShops.find((shop) => String(shop.id) === String(shopId));

  const handleLocationCaptured = (loc) => {
    setGpsData(loc);
  };

  // Auto-parse voice order
  useEffect(() => {
    if (inputType === "voice" && voiceNotes.length > 0 && !voiceProcessing) {
      handleSubmitVoiceOrder();
    }
  }, [voiceNotes, inputType]);

  // Handlers for Text Orders
  const handleProductChange = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    setSelectedProduct(product);
    setSelectedVariant(null);
    setNewItem({
      productId,
      variantId: "",
      name: product ? product.name : "",
      size: "",
      quantity: 1,
      price: "",
      is_carton: false,
      carton_id: "",
    });
  };

  const handleVariantChange = (variantId) => {
    if (!selectedProduct) return;
    const variant = selectedProduct.variants_data.find((v) => v.id === parseInt(variantId));
    setSelectedVariant(variant);
    const defaultPrice = variant?.loose?.price ? parseFloat(variant.loose.price) : 0;
    setNewItem((prev) => ({
      ...prev,
      variantId,
      size: variant ? `${variant.size}${variant.weight_unit}` : "",
      price: defaultPrice.toString(),
      is_carton: false,
      carton_id: "",
    }));
  };

const handleQuantityChange = (quantity, type) => {
  // Allow empty string so user can clear input
  if (quantity === "") {
    setNewItem((prev) => ({
      ...prev,
      quantity: "",
      is_carton: type === "carton",
    }));
    return;
  }

  const parsedQty = parseInt(quantity, 10);

  // If it's not a number or less than 1, ignore
  if (isNaN(parsedQty) || parsedQty < 1) return;

  const isCarton = type === "carton";
  const carton = isCarton && selectedVariant?.cartons?.[0];

  const defaultPrice = isCarton && carton
    ? parseFloat(carton.price)
    : selectedVariant?.loose?.price
    ? parseFloat(selectedVariant.loose.price)
    : 0;

  setNewItem((prev) => {
    const typeChanged = isCarton !== prev.is_carton;
    const newPrice =
      typeChanged || !prev.price || prev.price === ""
        ? defaultPrice.toString()
        : prev.price;

    return {
      ...prev,
      quantity: parsedQty,
      is_carton: isCarton,
      carton_id: isCarton && carton ? carton.id : "",
      price: newPrice,
    };
  });
};

  const handlePriceChange = (price) => {
    const parsedPrice = price ? parseFloat(price) : "";
    setNewItem((prev) => ({
      ...prev,
      price: isNaN(parsedPrice) ? "" : parsedPrice.toString(),
    }));
  };

  const handleVoicePriceChange = (id, price) => {
    const parsedPrice = price ? parseFloat(price) : "";
    setVoiceOrderParsed((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, price: isNaN(parsedPrice) ? "" : parsedPrice.toString() }
          : item
      )
    );
  };

  const addOrderItem = () => {
    if (selectedProduct && selectedVariant && newItem.quantity > 0 && newItem.price !== "") {
      setOrderItems([
        ...orderItems,
        {
          ...newItem,
          id: Date.now(),
          price: parseFloat(newItem.price),
        },
      ]);
      setNewItem({
        productId: "",
        variantId: "",
        name: "",
        size: "",
        quantity: 1,
        price: "",
        is_carton: false,
        carton_id: "",
      });
      setSelectedProduct(null);
      setSelectedVariant(null);
    } else {
      toast.error("Please select product, variant, quantity, and price");
    }
  };

  const removeOrderItem = (itemId) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return inputType === "text"
      ? orderItems.reduce((total, item) => total + item.quantity * (parseFloat(item.price) || 0), 0)
      : voiceOrderParsed.reduce((total, item) => total + item.quantity * (parseFloat(item.price) || 0), 0);
  };

  // Voice Recording Handlers
  const startRecording = async () => {
    if (inputType === "voice" && voiceNotes.length >= 1) {
      toast.error("Only one voice note is allowed for voice orders.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        setVoiceNotes([{ url, blob }]);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
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

  const startExtraRecording = async () => {
    if (extraVoiceNotes.length >= 1) {
      toast.error("Only one extra voice note is allowed.");
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
      const res = await api.post("/plants-mall-orders/api/orders/speech-to-text/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      const validItems = [];
      const unavailableItems = [];
      (data.results || []).forEach((item, idx) => {
        if (item.product && !item.message) {
          validItems.push({
            id: Date.now() + idx,
            productId: item.product,
            variantId: item.variant,
            name: item.product_name,
            size: item.variant_size || "-",
            quantity: parseInt(item.quantity) || 0,
            price: parseFloat(item.price).toString(),
            is_carton: item.is_carton === "true",
            carton_id: item.carton_id || "",
          });
        } else if (!item.product && item.message) {
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
    const sanitizeNumber = (value, decimals = 2) => {
      if (value == null || isNaN(value)) return "0.00";
      return parseFloat(value).toFixed(decimals);
    };
    if (inputType === "text") {
      if (orderItems.length === 0) {
        toast.error("Please add at least one item for text orders.");
        return;
      }
      formData.append(
        "items_data",
        JSON.stringify(
          orderItems.map((item) => ({
            product: parseInt(item.productId),
            variant: parseInt(item.variantId),
            is_carton: item.is_carton,
            carton_id: item.is_carton ? item.carton_id : "",
            quantity: parseInt(item.quantity) || 0,
            discount_price: sanitizeNumber(item.price),
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
            product: parseInt(item.productId),
            variant: parseInt(item.variantId),
            is_carton: item.is_carton,
            carton_id: item.is_carton ? item.carton_id : "",
            quantity: parseInt(item.quantity) || 0,
            discount_price: sanitizeNumber(item.price),
          }))
        )
      );
      voiceNotes.forEach((note) => formData.append("voice_notes_data", note.blob));
    }
    formData.append("latitude", gpsData.lat ? sanitizeNumber(gpsData.lat, 6) : "");
    formData.append("longitude", gpsData.lng ? sanitizeNumber(gpsData.lng, 6) : "");
    formData.append("accuracy", gpsData.accuracy ? sanitizeNumber(gpsData.accuracy, 2) : "");
    try {
      setSubmitting(true);
      const response = await dispatch(submitorder(formData)).unwrap();
      toast.success("Order submitted successfully!");
      setOrderItems([]);
      setNewItem({
        productId: "",
        variantId: "",
        name: "",
        size: "",
        quantity: 1,
        price: "",
        is_carton: false,
        carton_id: "",
      });
      setVoiceNotes([]);
      setExtraVoiceNotes([]);
      setVoiceOrderParsed([]);
      setSelectedProduct(null);
      setSelectedVariant(null);

      navigate("/order-receipt", { state: { order: response } });
      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
      console.error("Order submission failed:", err);
      let message = "Failed to submit order. Please try again.";
      if (err?.variant) {
        message = err.variant;
      } else if (err?.message) {
        message = err.message;
      } else if (err?.non_field_errors?.length) {
        message = err.non_field_errors[0];
      } else if (typeof err === "string") {
        message = err;
      } else if (typeof err === "object") {
        const firstKey = Object.keys(err)[0];
        if (firstKey && err[firstKey]) {
          message = Array.isArray(err[firstKey]) ? err[firstKey][0] : err[firstKey];
        }
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-1 sm:p-8 max-w-7xl mx-auto ">
      {/* Tabs */}
      <div className="flex space-x-2 border-b-2 border-gray-100 mb-6">
        <button
          onClick={() => setView("new")}
          className={`px-4 py-3 text-sm font-semibold rounded-t-lg transition-all ${
            view === "new"
              ? "border-b-4 border-emerald-600 text-emerald-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Take New Order
        </button>
        <button
          onClick={() => setView("history")}
          className={`px-4 py-3 text-sm font-semibold rounded-t-lg transition-all ${
            view === "history"
              ? "border-b-4 border-emerald-600 text-emerald-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Order History
        </button>
      </div>

      {view === "new" ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-2xl font-bold text-gray-900">Create a New Order</h3>
            <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => {
                  if (inputType === "voice") {
                    voiceNotes.forEach((note) => URL.revokeObjectURL(note.url));
                    setVoiceNotes([]);
                    setVoiceOrderParsed([]);
                    setUnavailableVoiceItems([]);
                    setVoiceProcessing(false);
                    setIsRecording(false);
                  }
                  setInputType("text");
                }}
                className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  inputType === "text"
                    ? "bg-white text-emerald-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Text
              </button>
              <button
                onClick={() => {
                  if (inputType === "text") {
                    setOrderItems([]);
                    setNewItem({
                      productId: "",
                      variantId: "",
                      name: "",
                      size: "",
                      quantity: 1,
                      price: "",
                      is_carton: false,
                      carton_id: "",
                    });
                    setSelectedProduct(null);
                    setSelectedVariant(null);
                  }
                  setInputType("voice");
                }}
                className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  inputType === "voice"
                    ? "bg-white text-emerald-600 shadow-md"
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
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200 shadow-sm flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg flex items-center justify-center shadow-md">
                <Store className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedShop.shop_name}</h4>
                <p className="text-sm text-gray-600">{formatAddress(selectedShop.shop_address)}</p>
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

          {/* Order Inputs for Text Orders */}
          {inputType === "text" && (
            <div className="bg-white rounded-xl p-6 space-y-6 border border-gray-100 shadow-md">
              <h4 className="text-lg font-semibold text-gray-800">Add Items</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Product Dropdown */}
                  <div>
                    <label
                      htmlFor="product-select"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Product
                    </label>

                    <div className="relative">
                      <select
                        id="product-select"
                        value={newItem.productId}
                        onChange={(e) => handleProductChange(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm 
                                  focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white 
                                  text-gray-700 text-sm appearance-none transition-colors"
                      >
                        <option value="" disabled>
                          Select Product
                        </option>
                        {productsLoading && <option>Loading...</option>}
                        {productsError && <option disabled>Error loading products</option>}
                        {!productsLoading &&
                          !productsError &&
                          products
                            .filter((p) => p.variants_data && p.variants_data.length > 0)
                            .map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                      </select>

                      {/* Custom arrow */}
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                {/* Variant Dropdown */}
                <div>
                  <label
                    htmlFor="variant-select"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Size
                  </label>

                  <div className="relative">
                    {/* Left icon */}
                    {/* <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /> */}

                    <select
                      id="variant-select"
                      value={newItem.variantId}
                      onChange={(e) => handleVariantChange(e.target.value)}
                      disabled={!selectedProduct}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm 
                                focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white 
                                text-gray-700 text-sm appearance-none transition-colors
                                disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>
                        Select Size
                      </option>
                      {selectedProduct?.variants_data.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {`${variant.size}${variant.weight_unit}`}
                        </option>
                      ))}
                    </select>

                    {/* Custom arrow */}
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* Loose Quantity */}
                <div>
                  <label htmlFor="loose-quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Loose Quantity
                  </label>
                  <input
                    id="loose-quantity"
                    type="number"
                    // min="1"
                    value={newItem.is_carton ? "" : newItem.quantity}
                    onChange={(e) => handleQuantityChange(e.target.value, "loose")}
                    disabled={newItem.is_carton || !selectedVariant}
                    placeholder="Loose Quantity"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Carton Quantity */}
                <div>
                  <label htmlFor="carton-quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Carton Quantity
                  </label>
                  <input
                    id="carton-quantity"
                    type="number"
                    // min="1"
                    value={newItem.is_carton ? newItem.quantity : ""}
                    onChange={(e) => handleQuantityChange(e.target.value, "carton")}
                    disabled={!selectedVariant || !selectedVariant?.cartons?.length}
                    placeholder="Carton Quantity"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Price Input */}
                <div>
                  <label htmlFor="price-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rs)
                  </label>
                  <input
                    id="price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    disabled={!selectedVariant}
                    placeholder="Enter Price"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Add Item Button */}
              <button
                type="button"
                onClick={addOrderItem}
                className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition-colors flex items-center justify-center font-semibold"
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
              <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
                {inputType === "text" && orderItems.length > 0 && (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 flex-col md:flex-row sm:flex-row"
                      >
                        <div>
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-600">
                            <span className="font-mono">{item.quantity}</span> ×{" "}
                            <span className="font-mono">Rs {parseFloat(item.price).toFixed(2)}</span>{" "}
                            ({item.size}, {item.is_carton ? "Carton" : "Loose"})
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-600">
                            Rs {(item.quantity * parseFloat(item.price)).toFixed(2)}
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
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg font-bold text-lg">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-emerald-700">Rs {getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {inputType === "voice" && voiceOrderParsed.length > 0 && (
                  <div className="space-y-3">
                    {voiceOrderParsed.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-600">
                            <span className="font-mono">{item.quantity}</span> ×{" "}
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handleVoicePriceChange(item.id, e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                            />{" "}
                            ({item.size}, {item.is_carton ? "Carton" : "Loose"})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">
                            Rs {(item.quantity * parseFloat(item.price)).toFixed(2)}
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
                    {unavailableVoiceItems.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {unavailableVoiceItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                          >
                            <div>
                              <h5 className="font-medium text-red-700">{item.name}</h5>
                              <p className="text-sm text-red-600">{item.message}</p>
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
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg font-bold text-lg">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-emerald-700">
                        Rs {getTotalAmount().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voice Notes Section */}
          {inputType === "voice" && (
            <div className="bg-emerald-100 rounded-xl p-6 space-y-4 border border-emerald-200">
              <h4 className="text-md font-semibold text-emerald-800">Record Main Order</h4>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <Mic className="h-5 w-5 mr-2" />
                <span>{isRecording ? "Stop Recording..." : "Start Recording"}</span>
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
                      <svg className="animate-spin h-6 w-6 text-emerald-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span className="ml-2 text-emerald-600 font-semibold">Parsing voice order...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Extra Voice Notes */}
          {inputType === "text" && (
            <div className="bg-yellow-50 rounded-xl p-6 space-y-4 border border-yellow-200">
              <h4 className="text-md font-semibold text-yellow-800">Optional Extra Voice Note</h4>
              <button
                onClick={isExtraRecording ? stopExtraRecording : startExtraRecording}
                className={`flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  isExtraRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-yellow-600 text-white hover:bg-yellow-700"
                }`}
              >
                <Mic className="h-5 w-5 mr-2" />
                <span>{isExtraRecording ? "Stop Recording..." : "Record Extra Note"}</span>
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

          {/* GPS Capture */}
          <GpsCapture
            onLocationCaptured={handleLocationCaptured}
            initialGps={gpsData}
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmitOrder}
            disabled={
              submitting ||
              (inputType === "text" && orderItems.length === 0) ||
              (inputType === "voice" && voiceOrderParsed.length === 0)
            }
            className={`w-full px-6 py-4 rounded-lg shadow-lg text-lg font-semibold mt-6 flex items-center justify-center transition-colors duration-200 ${
              submitting ||
              (inputType === "text" && orderItems.length === 0) ||
              (inputType === "voice" && voiceOrderParsed.length === 0)
                ? "bg-gray-300 text-gray-500 border border-gray-400 cursor-not-allowed opacity-70"
                : "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600"
            }`}
            style={{
              boxShadow:
                submitting ||
                (inputType === "text" && orderItems.length === 0) ||
                (inputType === "voice" && voiceOrderParsed.length === 0)
                  ? "none"
                  : "0 4px 14px 0 rgba(16,185,129,0.2)",
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
                    d="M4 12a8 8 0 018-8v8z"
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
      ) : (
        <OrderHistory shopId={shopId} />
      )}
    </div>
  );
};

export default OrderTaking;