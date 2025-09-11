// src/components/orders/OrderTaking.jsx
import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addOrder } from "../../../store/slices/ordersSlice";
import OrderHistory from "./OrderHistory";
import { Plus, Mic, MessageSquare, Store, Trash2, X } from "lucide-react";
import "../../../assets/css/OrderTaking.css";
import GpsCapture from "../GpsCapture.jsx";

const OrderTaking = ({ shopId }) => {
  const dispatch = useDispatch();
  const shops = useSelector((state) => state.shops.shops);

  const [view, setView] = useState("new");
  const [orderItems, setOrderItems] = useState([]);
  const [inputType, setInputType] = useState("text");
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    price: 0,
    size: "",
  });

  const [voiceNotes, setVoiceNotes] = useState([]); // for order voice
  const [extraVoiceNotes, setExtraVoiceNotes] = useState([]); // optional extra voice notes

  const [isRecording, setIsRecording] = useState(false);
  const [isExtraRecording, setIsExtraRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const mediaRecorderExtraRef = useRef(null);
  const chunksExtraRef = useRef([]);

  const [gpsData, setGpsData] = useState(null); // unified GPS
  const salesmanId = "salesman1";
  const selectedShop = shops.find((shop) => shop.id === shopId);

  // ➕ Add text order item
  const addOrderItem = () => {
    if (newItem.name && newItem.price > 0) {
      setOrderItems([...orderItems, { ...newItem, id: Date.now() }]);
      setNewItem({ name: "", quantity: 1, price: 0, size: "" });
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setVoiceNotes((prev) => [...prev, { url, blob }]);
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

  // 📤 Submit order
  const handleSubmitOrder = () => {
    if (!selectedShop || (orderItems.length === 0 && voiceNotes.length === 0)) {
      alert("Please add items or record a note before submitting");
      return;
    }

    if (!gpsData || gpsData.status !== "ready") {
      alert("📍 Please capture your location before submitting the order.");
      return;
    }

    const orderData = {
      shopId: selectedShop.id,
      salesmanId,
      items: orderItems,
      totalAmount: getTotalAmount(),
      orderType: inputType,
      notes: inputType === "voice" ? "Voice order transcription" : "Text order",
      location: {
        lat: gpsData.lat,
        lng: gpsData.lng,
        accuracy: gpsData.accuracy,
      },
      voiceNotes, // main order voice notes
      extraVoiceNotes, // optional extra notes
    };

      // 👇 Log the payload
    console.log("📦 Order Payload:", orderData);
    dispatch(addOrder(orderData));

    setOrderItems([]);
    setNewItem({ name: "", quantity: 1, price: 0, size: "" });
    setVoiceNotes([]);
    setExtraVoiceNotes([]);

    alert("✅ Order submitted successfully!");
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
            <h3 className="text-lg font-semibold text-gray-900">Take New Order</h3>
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
                <span className="text-sm font-medium text-blue-900">Selected Shop</span>
              </div>
              <p className="text-gray-800 font-semibold">{selectedShop.name}</p>
              <p className="text-sm text-gray-600">{selectedShop.category}</p>
            </div>
          )}

          {/* Order Inputs */}
          {inputType === "text" && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: parseInt(e.target.value) })
                  }
                  placeholder="Qty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newItem.size}
                  onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
                  placeholder="Size"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: parseFloat(e.target.value) })
                  }
                  placeholder="Price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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

          {inputType === "voice" && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center justify-center w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  isRecording
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
                }`}
              >
                <Mic className={`h-4 w-4 mr-2 ${isRecording ? "animate-pulse" : ""}`} />
                <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
              </button>

              {voiceNotes.length > 0 &&
                voiceNotes.map((note, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-center justify-between p-3 bg-white border rounded-lg gap-2"
                  >
                    <audio controls src={note.url} className="w-full" />
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
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="text-xl font-bold text-green-600">
                  Rs {getTotalAmount().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* 🔊 Extra Voice Notes (Optional) */}
          <div className="bg-yellow-50 rounded-xl p-4 space-y-4">
            <h4 className="text-md font-semibold text-yellow-800">
              Optional Extra Voice Note
            </h4>
            <button
              onClick={isExtraRecording ? stopExtraRecording : startExtraRecording}
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
                {isExtraRecording ? "Stop Recording" : "Record Extra Voice Note"}
              </span>
            </button>

            {extraVoiceNotes.length > 0 &&
              extraVoiceNotes.map((note, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-center justify-between p-3 bg-white border rounded-lg gap-2"
                >
                  <audio controls src={note.url} className="w-full" />
                  <button
                    onClick={() => removeExtraVoiceNote(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
          </div>

          {/* Unified GPS */}
          <GpsCapture onLocationCaptured={(data) => setGpsData(data)} />

          <button
            onClick={handleSubmitOrder}
            disabled={
              (orderItems.length === 0 && voiceNotes.length === 0) ||
              !gpsData ||
              gpsData.status !== "ready"
            }
            className="w-full bg-green-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
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
