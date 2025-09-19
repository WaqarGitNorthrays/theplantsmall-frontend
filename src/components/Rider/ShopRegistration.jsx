import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { addShop, updateShop } from "../../store/slices/shopsSlice";
import { Camera, Mic, Upload, X } from "lucide-react";
import AlertMessage from "../common/AlertMessage.jsx";
import GpsCapture from "./GpsCapture.jsx";
import VoiceNotesSection from "./VoiceNotesSection.jsx";
import api from "../../utils/axiosInstance.js";

async function computeHash(blob) {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const ShopRegistration = ({ shop = null, mode = "create", onSuccess }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    ownerPhone: "",
    frontImage: null,
    frontImagePreview: "",
    insideImages: [],
    deletedInsideImages: [],
    voiceNotes: [],
    existingVoiceNotes: [],
    deletedVoiceNotes: [],
  });
  const [recordingField, setRecordingField] = useState(null); // Track which field is recording
  const recognitionRef = useRef(null); // Store recognition instance

  const [gps, setGps] = useState(null);
  const [shopAddress, setShopAddress] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });
  const [loading, setLoading] = useState(false);
  const [existingImageHashes, setExistingImageHashes] = useState({});
  const [currentImageHashes, setCurrentImageHashes] = useState(new Set());

  const objectUrlsRef = useRef(new Set());
  const hasPrepopulated = useRef(false);

  // Prepopulate form on edit
  useEffect(() => {
    if (shop && mode === "edit" && !hasPrepopulated.current) {
      setFormData({
        name: shop.shop_name || "",
        ownerName: shop.owner_name || "",
        ownerPhone: shop.owner_phone || "",
        frontImage: null,
        frontImagePreview: shop.shop_image || "",
        insideImages: [],
        deletedInsideImages: [],
        voiceNotes: [],
        existingVoiceNotes: shop.voice_notes || [],
        deletedVoiceNotes: [],
      });
      setGps({
        lat: shop.latitude,
        lng: shop.longitude,
        accuracy: shop.accuracy,
        status: "ready",
      });
      setShopAddress(shop.shop_address || "");
      hasPrepopulated.current = true;
    }
    return () => {
      hasPrepopulated.current = false;
    };
  }, [shop?.id, mode]);

  // Compute hashes for existing images in edit mode
  useEffect(() => {
    if (mode === "edit" && shop?.images?.length) {
      const computeHashes = async () => {
        const hashes = {};
        const promises = shop.images.map(async (img) => {
          try {
            const response = await fetch(img.image);
            if (!response.ok) return;
            const blob = await response.blob();
            const hash = await computeHash(blob);
            hashes[img.id] = hash;
          } catch (e) {
            console.error("Failed to hash existing image", img.id, e);
          }
        });
        await Promise.all(promises);
        setExistingImageHashes(hashes);
        setCurrentImageHashes(new Set(Object.values(hashes)));
      };
      computeHashes();
    }
  }, [shop, mode]);

  // Compute all inside images with deduplication by id
  const allInsideImages = useMemo(() => {
    const existing = (shop?.images || [])
      .filter((img) => !formData.deletedInsideImages.includes(img.id))
      .map((img) => ({
        type: "existing",
        url: img.image,
        id: `existing-${img.id}`,
        file: null,
        originalId: img.id,
      }));

    const newlyAdded = formData.insideImages.map((img) => ({
      type: "new",
      url: img.preview,
      id: img.id,
      file: img.file,
    }));

    const seen = new Set();
    return [...existing, ...newlyAdded].filter((img) => {
      if (seen.has(img.id)) return false;
      seen.add(img.id);
      return true;
    });
  }, [shop?.images, formData.insideImages, formData.deletedInsideImages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleVoiceInput = (field) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    // If already recording this field, stop
    if (recordingField === field && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    // Start new recognition
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    let finalTranscript = "";
    recognition.onstart = () => {
      setRecordingField(field);
    };
    recognition.onend = () => {
      setRecordingField(null);
      recognitionRef.current = null;
      if (finalTranscript) {
        // Detect Urdu script (basic check for Urdu Unicode range)
        const urduRegex = /[\u0600-\u06FF]/;
        if (urduRegex.test(finalTranscript)) {
          // If Urdu detected, re-run recognition in Urdu
          const urduRecognition = new window.webkitSpeechRecognition();
          urduRecognition.lang = "ur-PK";
          urduRecognition.continuous = true;
          urduRecognition.interimResults = true;
          recognitionRef.current = urduRecognition;
          let urduFinal = "";
          urduRecognition.onstart = () => setRecordingField(field);
          urduRecognition.onend = () => {
            setRecordingField(null);
            recognitionRef.current = null;
            if (urduFinal) setFormData((prev) => ({ ...prev, [field]: urduFinal }));
          };
          urduRecognition.onresult = (ev) => {
            for (let i = ev.resultIndex; i < ev.results.length; ++i) {
              if (ev.results[i].isFinal) {
                urduFinal += ev.results[i][0].transcript;
              }
            }
          };
          urduRecognition.start();
        } else {
          setFormData((prev) => ({ ...prev, [field]: finalTranscript }));
        }
      }
    };
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
    };
    recognition.start();
  };

  const handleFrontImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.frontImagePreview && formData.frontImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(formData.frontImagePreview);
      objectUrlsRef.current.delete(formData.frontImagePreview);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.add(objectUrl);

    setFormData((prev) => ({
      ...prev,
      frontImage: file,
      frontImagePreview: objectUrl,
    }));
    e.target.value = "";
  };

  const addInsideImages = async (files) => {
    if (!files?.length) return;

    const newImages = [];
    for (const file of Array.from(files)) {
      const hash = await computeHash(file);
      if (currentImageHashes.has(hash)) {
        console.log("Duplicate image detected and skipped");
        continue;
      }

      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(objectUrl);

      newImages.push({
        file,
        preview: objectUrl,
        id: hash,
        hash,
      });
    }

    if (newImages.length > 0) {
      setFormData((prev) => ({
        ...prev,
        insideImages: [...prev.insideImages, ...newImages],
      }));

      setCurrentImageHashes((prev) => {
        const newSet = new Set(prev);
        newImages.forEach((img) => newSet.add(img.hash));
        return newSet;
      });
    }
  };

  const handleInsideImagesUpload = (e) => {
    addInsideImages(e.target.files);
    e.target.value = "";
  };

  const handleInsideImageCapture = (e) => {
    addInsideImages(e.target.files);
    e.target.value = "";
  };

  const removeInsideImage = useCallback(
    (imageToRemove) => {
      let hash;
      if (imageToRemove.type === "existing") {
        hash = existingImageHashes[imageToRemove.originalId];
        setFormData((prev) => ({
          ...prev,
          deletedInsideImages: [...prev.deletedInsideImages, imageToRemove.originalId],
        }));
      } else {
        hash = imageToRemove.hash;
        if (imageToRemove.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(imageToRemove.preview);
          objectUrlsRef.current.delete(imageToRemove.preview);
        }
        setFormData((prev) => ({
          ...prev,
          insideImages: prev.insideImages.filter((img) => img.id !== imageToRemove.id),
        }));
      }

      if (hash) {
        setCurrentImageHashes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(hash);
          return newSet;
        });
      }
    },
    [existingImageHashes]
  );

  const handleLocationCaptured = (loc) => {
    setGps(loc);
    if (loc?.address) setShopAddress(loc.address);
  };

  const handleDeleteExistingVoiceNote = (id) => {
    setFormData((prev) => ({
      ...prev,
      deletedVoiceNotes: [...prev.deletedVoiceNotes, id],
      existingVoiceNotes: prev.existingVoiceNotes.filter((n) => n.id !== id),
    }));
  };

  const resetForm = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();

    setFormData({
      name: "",
      ownerName: "",
      ownerPhone: "",
      frontImage: null,
      frontImagePreview: "",
      insideImages: [],
      deletedInsideImages: [],
      voiceNotes: [],
      existingVoiceNotes: [],
      deletedVoiceNotes: [],
    });
    setGps(null);
    setShopAddress("");
    setExistingImageHashes({});
    setCurrentImageHashes(new Set());
    hasPrepopulated.current = false;
  }, []);

  const getChangedFields = () => {
    if (!shop) return { ...formData };

    const changed = {};
    if (formData.name !== shop.shop_name) changed.shop_name = formData.name;
    if (formData.ownerName !== shop.owner_name) changed.owner_name = formData.ownerName;
    if (formData.ownerPhone !== shop.owner_phone) changed.owner_phone = formData.ownerPhone;
    if (shopAddress !== shop.shop_address) changed.shop_address = shopAddress;

    if (gps) {
      const lat = Number(gps.lat).toFixed(6);
      const lng = Number(gps.lng).toFixed(6);
      const acc = Number(gps.accuracy).toFixed(2);
      if (lat !== String(shop.latitude)) changed.latitude = lat;
      if (lng !== String(shop.longitude)) changed.longitude = lng;
      if (acc !== String(shop.accuracy)) changed.accuracy = acc;
    }

    if (formData.frontImage) changed.shop_image = formData.frontImage;
    if (formData.insideImages.length) changed.images = formData.insideImages.map((img) => img.file);
    if (formData.deletedInsideImages.length) changed.delete_images = formData.deletedInsideImages;
    if (formData.voiceNotes.length) changed.voice_notes = formData.voiceNotes.map((n) => n.blob);
    if (formData.deletedVoiceNotes.length) changed.delete_voice_notes = formData.deletedVoiceNotes;

    return changed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.ownerName || !formData.ownerPhone) {
      setAlert({ message: "Please fill all required fields.", type: "error", visible: true });
      return;
    }
    if (!gps || gps.status !== "ready") {
      setAlert({ message: "Please capture GPS location.", type: "warning", visible: true });
      return;
    }

    setLoading(true);

    const payload = new FormData();
    const roundedGps = { lat: Number(gps.lat).toFixed(6), lng: Number(gps.lng).toFixed(6), accuracy: Number(gps.accuracy).toFixed(2) };

    if (mode === "edit" && shop?.id) {
      const changedFields = getChangedFields();
      payload.append("shop_name", formData.name);
      payload.append("owner_name", formData.ownerName);
      payload.append("owner_phone", formData.ownerPhone);
      payload.append("shop_address", shopAddress);
      payload.append("latitude", roundedGps.lat);
      payload.append("longitude", roundedGps.lng);
      payload.append("accuracy", roundedGps.accuracy);

      if (changedFields.shop_image) payload.append("shop_image", changedFields.shop_image);
      if (changedFields.images) changedFields.images.forEach((img) => payload.append("images", img));
      if (changedFields.delete_images) payload.append("delete_images", JSON.stringify(changedFields.delete_images));
      if (changedFields.voice_notes) changedFields.voice_notes.forEach((blob) => payload.append("voice_notes", blob));
      if (changedFields.delete_voice_notes) payload.append("delete_voice_notes", JSON.stringify(changedFields.delete_voice_notes));
    } else {
      payload.append("shop_name", formData.name);
      payload.append("owner_name", formData.ownerName);
      payload.append("owner_phone", formData.ownerPhone);
      payload.append("shop_address", shopAddress);
      payload.append("latitude", roundedGps.lat);
      payload.append("longitude", roundedGps.lng);
      payload.append("accuracy", roundedGps.accuracy);
      if (formData.frontImage) payload.append("shop_image", formData.frontImage);
      formData.insideImages.forEach((img) => payload.append("images", img.file));
      if (formData.deletedInsideImages.length) payload.append("delete_images", JSON.stringify(formData.deletedInsideImages));
      formData.voiceNotes.forEach((n) => payload.append("voice_notes", n.blob));
      if (formData.deletedVoiceNotes.length) payload.append("delete_voice_notes", JSON.stringify(formData.deletedVoiceNotes));
    }
try {
  let res;
  if (mode === "edit" && shop?.id) {
    res = await api.put(
      `plants-mall-shops/api/shops/${shop.id}/edit/`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    dispatch(updateShop(res.data));
    resetForm();
  } else {
    res = await api.post(
      `plants-mall-shops/api/shops/create/`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    dispatch(addShop(res.data));
    resetForm();
  }

  setAlert({
    message: `Shop ${mode === "edit" ? "updated" : "registered"} successfully!`,
    type: "success",
    visible: true,
  });

  if (onSuccess) onSuccess();
} catch (err) {
  console.error("Shop submission failed:", err);

  if (err.response?.data) {
    // Backend returned validation errors
    const errors = err.response.data;

    let errorMessages = [];
    if (typeof errors === "object") {
      // If backend sends {error: '...'} format, just show the value
      if (Object.keys(errors).length === 1 && errors.error) {
        errorMessages.push(errors.error);
      } else {
        for (const key in errors) {
          if (key === "shop_image") {
            if (Array.isArray(errors[key])) {
              errorMessages.push(errors[key].join(", "));
            } else {
              errorMessages.push(errors[key]);
            }
          } else {
            if (Array.isArray(errors[key])) {
              errorMessages.push(`${key}: ${errors[key].join(", ")}`);
            } else {
              errorMessages.push(`${key}: ${errors[key]}`);
            }
          }
        }
      }
    } else {
      errorMessages.push("Something went wrong.");
    }

    setAlert({
      message: errorMessages.join("\n"),
      type: "error",
      visible: true,
    });
  } else {
    setAlert({
      message: "Failed to submit shop. Please try again.",
      type: "error",
      visible: true,
    });
  }
} finally {
  setLoading(false);
}

  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 relative">
      {alert.visible && <AlertMessage {...alert} onClose={() => setAlert({ ...alert, visible: false })} />}
      {loading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 rounded-xl">
          <div className="loader border-4 border-t-4 border-green-600 w-12 h-12 rounded-full animate-spin"></div>
        </div>
      )}
      <div className="flex items-center space-x-3 mb-2">
        <div className="bg-green-100 p-2 rounded-lg">
          <Camera className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{mode === "edit" ? "Edit Shop" : "Register New Shop"}</h2>
          <p className="text-sm text-gray-600">Fill the form and optionally add voice notes</p>
        </div>
      </div>

      <GpsCapture onLocationCaptured={handleLocationCaptured} initialGps={gps} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Shop Name</label>
          <div className="flex gap-2 items-center">
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="flex-1 px-4 py-3 border rounded-lg" placeholder="Enter shop name" />
            <button
              type="button"
              onClick={() => handleVoiceInput("name")}
              className={`p-3 rounded-lg border transition-colors duration-200 ${recordingField === 'name' ? 'bg-green-600 border-green-700' : 'bg-gray-100 border-gray-300'} flex items-center justify-center`}
              aria-label={recordingField === 'name' ? 'Stop Recording' : 'Start Recording'}
            >
              {recordingField === 'name' ? (
                <svg className="h-5 w-5 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="8" />
                </svg>
              ) : (
                <Mic className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Owner Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Owner Name</label>
          <div className="flex gap-2 items-center">
            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required className="flex-1 px-4 py-3 border rounded-lg" placeholder="Enter owner name" />
            <button
              type="button"
              onClick={() => handleVoiceInput("ownerName")}
              className={`p-3 rounded-lg border transition-colors duration-200 ${recordingField === 'ownerName' ? 'bg-green-600 border-green-700' : 'bg-gray-100 border-gray-300'} flex items-center justify-center`}
              aria-label={recordingField === 'ownerName' ? 'Stop Recording' : 'Start Recording'}
            >
              {recordingField === 'ownerName' ? (
                <svg className="h-5 w-5 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="8" />
                </svg>
              ) : (
                <Mic className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Owner Phone */}
        <div>
          <label className="block text-sm font-medium mb-2">Owner Phone</label>
          <div className="flex gap-2 items-center">
            <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} required className="flex-1 px-4 py-3 border rounded-lg" placeholder="Enter phone number" />
            <button
              type="button"
              onClick={() => handleVoiceInput("ownerPhone")}
              className={`p-3 rounded-lg border transition-colors duration-200 ${recordingField === 'ownerPhone' ? 'bg-green-600 border-green-700' : 'bg-gray-100 border-gray-300'} flex items-center justify-center`}
              aria-label={recordingField === 'ownerPhone' ? 'Stop Recording' : 'Start Recording'}
            >
              {recordingField === 'ownerPhone' ? (
                <svg className="h-5 w-5 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="8" />
                </svg>
              ) : (
                <Mic className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Front Image */}
        <div>
          <label className="block text-sm font-medium mb-2">Front Image of Shop</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input id="frontImageUpload" type="file" accept="image/*" onChange={handleFrontImageUpload} className="hidden" />
            <input id="frontImageCapture" type="file" accept="image/*" capture="environment" onChange={handleFrontImageUpload} className="hidden" />
            <label htmlFor="frontImageUpload" className="flex items-center justify-center flex-1 px-4 py-3 border rounded-lg cursor-pointer">
              <Upload className="h-5 w-5 mr-2" /> Upload
            </label>
            <label htmlFor="frontImageCapture" className="flex items-center justify-center flex-1 px-4 py-3 border rounded-lg cursor-pointer">
              <Camera className="h-5 w-5 mr-2" /> Capture
            </label>
          </div>
          {formData.frontImagePreview && <img src={formData.frontImagePreview} alt="Preview" className="h-40 w-auto mt-3 rounded-lg border mx-auto" />}
        </div>

        {/* Inside Images */}
        <div>
          <label className="block text-sm font-medium mb-2">Inside Shop Images</label>
          <input id="insideImagesUpload" type="file" accept="image/*" multiple onChange={handleInsideImagesUpload} className="hidden" />
          <label htmlFor="insideImagesUpload" className="flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer mb-2">
            <Upload className="h-5 w-5 mr-2" /> Upload
          </label>
          <input id="insideImageCapture" type="file" accept="image/*" capture="environment" onChange={handleInsideImageCapture} className="hidden" />
          <label htmlFor="insideImageCapture" className="flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer">
            <Camera className="h-5 w-5 mr-2" /> Capture
          </label>

          {allInsideImages.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allInsideImages.map((image) => (
                <div key={image.id} className="relative">
                  <img src={image.url} alt={`Inside ${image.id}`} className="h-32 w-full object-cover rounded-lg border" />
                  <button type="button" onClick={() => removeInsideImage(image)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full flex items-center justify-center h-6 w-6">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <VoiceNotesSection voiceNotes={formData.voiceNotes} setFormData={setFormData} initialVoiceNotes={formData.existingVoiceNotes} onDeleteExisting={handleDeleteExistingVoiceNote} />

        {/* Submit */}
        <div className="pt-4">
          <button type="submit" className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700">
            {mode === "edit" ? "Update Shop" : "Register Shop"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShopRegistration;