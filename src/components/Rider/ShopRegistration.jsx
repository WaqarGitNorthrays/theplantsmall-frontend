import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addShop } from "../../store/slices/shopsSlice";
import { Camera, Mic, Upload } from "lucide-react";
import AlertMessage from "../common/AlertMessage.jsx";
import GpsCapture from "./GpsCapture.jsx";
import VoiceNotesSection from "./VoiceNotesSection.jsx"; // ⬅️ new
import api from "../../utils/axiosInstance.js";

const ShopRegistration = () => {
  const dispatch = useDispatch();

  // form + UI state
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    ownerPhone: "",
    frontImage: null,
    frontImagePreview: "",
    insideImages: [],
    insideImagePreviews: [],
    voiceNotes: [],
  });

  // GPS + Address
  const [gps, setGps] = useState(null);
  const [shopAddress, setShopAddress] = useState("");

  // Alert
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });



  const handleLocationCaptured = (loc) => {
    setGps(loc);
    if (loc?.address) {
      setShopAddress(loc.address);
    }
  };


  // 📝 Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // 🎤 Voice input for text fields
  const handleVoiceInput = (field) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prev) => ({ ...prev, [field]: transcript }));
    };
  };

  // 📷 Front image
  const handleFrontImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      frontImage: file,
      frontImagePreview: URL.createObjectURL(file),
    }));
  };

  // 📷 Inside images
  const handleInsideImagesUpload = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    setFormData((prev) => ({
      ...prev,
      insideImages: [...prev.insideImages, ...files],
      insideImagePreviews: [
        ...prev.insideImagePreviews,
        ...files.map((f) => URL.createObjectURL(f)),
      ],
    }));
  };

  const handleInsideImageCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      insideImages: [...prev.insideImages, file],
      insideImagePreviews: [
        ...prev.insideImagePreviews,
        URL.createObjectURL(file),
      ],
    }));
    e.target.value = "";
  };

  const removeInsideImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      insideImages: prev.insideImages.filter((_, i) => i !== index),
      insideImagePreviews: prev.insideImagePreviews.filter((_, i) => i !== index),
    }));
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.ownerName ||
      !formData.ownerPhone ||
      !formData.frontImage ||
      formData.insideImages.length === 0
    ) {
      setAlert({
        message: "Please complete all required fields.",
        type: "error",
        visible: true,
      });
      return;
    }
    if (!gps || gps.status !== "ready") {
      setAlert({
        message: "Please capture GPS location.",
        type: "warning",
        visible: true,
      });
      return;
    }

    const roundTo6 = (num) => parseFloat(num.toFixed(6));

    try {
      const payload = new FormData();
      payload.append("shop_name", formData.name);
      payload.append("owner_name", formData.ownerName);
      payload.append("owner_phone", formData.ownerPhone);
      payload.append("shop_image", formData.frontImage);
      payload.append("status", "open");
      payload.append("latitude", roundTo6(gps.lat));
      payload.append("longitude", roundTo6(gps.lng));
      payload.append("accuracy", gps.accuracy);
      payload.append("shop_address", shopAddress);

      formData.insideImages.forEach((img) => payload.append("images", img));
      formData.voiceNotes.forEach((note) =>
        payload.append("voice_notes", note.blob, "voice_note.webm")
      );

      const res = await api.post(
        "plants-mall-shops/api/shops/create/",
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      dispatch(addShop(res.data));
      setAlert({
        message: "Shop registered successfully!",
        type: "success",
        visible: true,
      });

      // Cleanup
      formData.voiceNotes.forEach((n) => URL.revokeObjectURL(n.url));
      if (formData.frontImagePreview)
        URL.revokeObjectURL(formData.frontImagePreview);
      formData.insideImagePreviews.forEach((url) => URL.revokeObjectURL(url));

      setFormData({
        name: "",
        ownerName: "",
        ownerPhone: "",
        frontImage: null,
        frontImagePreview: "",
        insideImages: [],
        insideImagePreviews: [],
        voiceNotes: [],
      });
      setGps(null);
      setShopAddress("");
    } catch (err) {
      console.error("❌ Shop registration failed:", err);
      setAlert({
        message: "Failed to register shop. Please try again.",
        type: "error",
        visible: true,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4">
      {alert.visible && (
        <AlertMessage
          message={alert.message}
          type={alert.type}
          visible={alert.visible}
          onClose={() => setAlert({ ...alert, visible: false })}
        />
      )}

      {/* Header */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="bg-green-100 p-2 rounded-lg">
          <Camera className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Register New Shop</h2>
          <p className="text-sm text-gray-600">
            Fill the form and optionally add voice notes
          </p>
        </div>
      </div>

      {/* GPS Capture */}
      <GpsCapture onLocationCaptured={handleLocationCaptured} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Shop Name</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-3 border rounded-lg"
              placeholder="Enter shop name"
            />
            <button
              type="button"
              onClick={() => handleVoiceInput("name")}
              className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Owner Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Owner Name</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-3 border rounded-lg"
              placeholder="Enter owner name"
            />
            <button
              type="button"
              onClick={() => handleVoiceInput("ownerName")}
              className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Owner Phone */}
        <div>
          <label className="block text-sm font-medium mb-2">Owner Phone</label>
          <div className="flex gap-2 items-center">
            <input
              type="tel"
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-3 border rounded-lg"
              placeholder="Enter phone number"
            />
            <button
              type="button"
              onClick={() => handleVoiceInput("ownerPhone")}
              className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Front Image */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Front Image of Shop
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="frontImageUpload"
              type="file"
              accept="image/*"
              onChange={handleFrontImageUpload}
              className="hidden"
            />
            <input
              id="frontImageCapture"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFrontImageUpload}
              className="hidden"
            />
            <label
              htmlFor="frontImageUpload"
              className="flex items-center justify-center flex-1 px-4 py-3 border rounded-lg cursor-pointer"
            >
              <Upload className="h-5 w-5 mr-2" /> Upload
            </label>
            <label
              htmlFor="frontImageCapture"
              className="flex items-center justify-center flex-1 px-4 py-3 border rounded-lg cursor-pointer"
            >
              <Camera className="h-5 w-5 mr-2" /> Capture
            </label>
          </div>
          {formData.frontImagePreview && (
            <img
              src={formData.frontImagePreview}
              alt="Preview"
              className="h-40 w-auto mt-3 rounded-lg border mx-auto"
            />
          )}
        </div>

        {/* Inside Images */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Inside Shop Images
          </label>
          <input
            id="insideImagesUpload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleInsideImagesUpload}
            className="hidden"
          />
          <label
            htmlFor="insideImagesUpload"
            className="flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer mb-2"
          >
            <Upload className="h-5 w-5 mr-2" /> Upload
          </label>
          <input
            id="insideImageCapture"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInsideImageCapture}
            className="hidden"
          />
          <label
            htmlFor="insideImageCapture"
            className="flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer"
          >
            <Camera className="h-5 w-5 mr-2" /> Capture
          </label>
          {formData.insideImagePreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.insideImagePreviews.map((url, i) => (
                <div key={i} className="relative">
                  <img
                    src={url}
                    alt={`Inside ${i}`}
                    className="h-32 w-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeInsideImage(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Voice Notes Section (separated) */}
        <VoiceNotesSection
          voiceNotes={formData.voiceNotes}
          setFormData={setFormData}
        />

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700"
          >
            Register Shop
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShopRegistration;
