import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addShop, updateShop } from "../../store/slices/shopsSlice";
import { Camera, Mic, Upload, X } from "lucide-react";
import AlertMessage from "../common/AlertMessage.jsx";
import GpsCapture from "./GpsCapture.jsx";
import VoiceNotesSection from "./VoiceNotesSection.jsx";
import api from "../../utils/axiosInstance.js";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

async function computeHash(blob) {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const ShopRegistration = ({mode = "create", onSuccess}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shopId } = useParams();
  const { nearbyShops } = useSelector((state) => state.shops);

let shop = null;
  if (mode === "edit") {
    shop = nearbyShops.find((s) => s.id === parseInt(shopId));
    if (!shop) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shop Not Found</h2>
          <p className="text-gray-600 mb-4">The shop you're trying to edit could not be found.</p>
          <button
            onClick={() => navigate("/salesman-dashboard/shops")}
            className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors"
          >
            Back to Shops
          </button>
        </div>
      );
    }
  }

  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    ownerPhone: "",
    is_whatsapp: true,
    frontImage: null,
    frontImagePreview: "",
    insideImages: [],
    deletedInsideImages: [],
    competitorImages: [],
    deletedCompetitorImages: [],
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
  const [existingCompetitorImageHashes, setExistingCompetitorImageHashes] = useState({});
  const [currentCompetitorImageHashes, setCurrentCompetitorImageHashes] = useState(new Set());
   // ✅ Add this state for error message
  const [phoneError, setPhoneError] = useState("");

  const objectUrlsRef = useRef(new Set());
  const hasPrepopulated = useRef(false);

  // Prepopulate form on edit
  useEffect(() => {
    if (shop && mode === "edit" && !hasPrepopulated.current) {
      setFormData({
        name: shop.shop_name || "",
        ownerName: shop.owner_name || "",
        ownerPhone: shop.owner_phone || "",
        is_whatsapp: shop.is_whatsapp || true,
        frontImage: null,
        frontImagePreview: shop.shop_image || "",
        insideImages: [],
        deletedInsideImages: [],
        competitorImages: [],
        deletedCompetitorImages: [],
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

  // Compute hashes for existing competitor images in edit mode
  useEffect(() => {
    if (mode === "edit" && shop?.competitor_images?.length) {
      const computeHashes = async () => {
        const hashes = {};
        const promises = shop.competitor_images.map(async (img) => {
          try {
            const response = await fetch(img.image);
            if (!response.ok) return;
            const blob = await response.blob();
            const hash = await computeHash(blob);
            hashes[img.id] = hash;
          } catch (e) {
            console.error("Failed to hash existing competitor image", img.id, e);
          }
        });
        await Promise.all(promises);
        setExistingCompetitorImageHashes(hashes);
        setCurrentCompetitorImageHashes(new Set(Object.values(hashes)));
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

  // Compute all competitor images with deduplication by id
  const allCompetitorImages = useMemo(() => {
    const existing = (shop?.competitor_images || [])
      .filter((img) => !formData.deletedCompetitorImages.includes(img.id))
      .map((img) => ({
        type: "existing",
        url: img.image,
        id: `existing-${img.id}`,
        file: null,
        originalId: img.id,
      }));

    const newlyAdded = formData.competitorImages.map((img) => ({
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
  }, [shop?.competitor_images, formData.competitorImages, formData.deletedCompetitorImages]);

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

const handleVoiceInput = (field, isNumeric = false) => {
  if (!("webkitSpeechRecognition" in window)) {
    toast.error("Voice recognition not supported in this browser.");
    return;
  }

  if (recordingField === field && recognitionRef.current) {
    recognitionRef.current.stop();
    return;
  }

  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = false;
  recognitionRef.current = recognition;

  let finalTranscript = "";

  recognition.onstart = () => setRecordingField(field);

  recognition.onend = () => {
    setRecordingField(null);
    recognitionRef.current = null;

    if (!finalTranscript) return;

    let valueToSet = finalTranscript;

    if (isNumeric) {
      // Convert spoken numbers to digits
      valueToSet = valueToSet
        .toLowerCase()
        .replace(/\bzero\b/g, "0")
        .replace(/\bone\b/g, "1")
        .replace(/\btwo\b/g, "2")
        .replace(/\bthree\b/g, "3")
        .replace(/\bfour\b/g, "4")
        .replace(/\bfive\b/g, "5")
        .replace(/\bsix\b/g, "6")
        .replace(/\bseven\b/g, "7")
        .replace(/\beight\b/g, "8")
        .replace(/\bnine\b/g, "9");

      // Keep only digits
      valueToSet = valueToSet.replace(/\D/g, "");
    } else {
      valueToSet = valueToSet.trim();
    }

    setFormData((prev) => ({ ...prev, [field]: valueToSet }));
  };

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + " ";
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

  const addCompetitorImages = async (files) => {
    if (!files?.length) return;

    const newImages = [];
    for (const file of Array.from(files)) {
      const hash = await computeHash(file);
      if (currentCompetitorImageHashes.has(hash)) {
        console.log("Duplicate competitor image detected and skipped");
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
        competitorImages: [...prev.competitorImages, ...newImages],
      }));

      setCurrentCompetitorImageHashes((prev) => {
        const newSet = new Set(prev);
        newImages.forEach((img) => newSet.add(img.hash));
        return newSet;
      });
    }
  };

  const handleCompetitorImagesUpload = (e) => {
    addCompetitorImages(e.target.files);
    e.target.value = "";
  };

  const handleCompetitorImageCapture = (e) => {
    addCompetitorImages(e.target.files);
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

  const removeCompetitorImage = useCallback(
    (imageToRemove) => {
      let hash;
      if (imageToRemove.type === "existing") {
        hash = existingCompetitorImageHashes[imageToRemove.originalId];
        setFormData((prev) => ({
          ...prev,
          deletedCompetitorImages: [...prev.deletedCompetitorImages, imageToRemove.originalId],
        }));
      } else {
        hash = imageToRemove.hash;
        if (imageToRemove.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(imageToRemove.preview);
          objectUrlsRef.current.delete(imageToRemove.preview);
        }
        setFormData((prev) => ({
          ...prev,
          competitorImages: prev.competitorImages.filter((img) => img.id !== imageToRemove.id),
        }));
      }

      if (hash) {
        setCurrentCompetitorImageHashes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(hash);
          return newSet;
        });
      }
    },
    [existingCompetitorImageHashes]
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
      is_whatsapp: true,
      frontImage: null,
      frontImagePreview: "",
      insideImages: [],
      deletedInsideImages: [],
      competitorImages: [],
      deletedCompetitorImages: [],
      voiceNotes: [],
      existingVoiceNotes: [],
      deletedVoiceNotes: [],
    });
    setGps(null);
    setShopAddress("");
    setExistingImageHashes({});
    setCurrentImageHashes(new Set());
    setExistingCompetitorImageHashes({});
    setCurrentCompetitorImageHashes(new Set());
    hasPrepopulated.current = false;
  }, []);

  const getChangedFields = () => {
    if (!shop) return { ...formData };

    const changed = {};
    if (formData.name !== shop.shop_name) changed.shop_name = formData.name;
    if (formData.ownerName !== shop.owner_name) changed.owner_name = formData.ownerName;
    if (formData.ownerPhone !== shop.owner_phone) changed.owner_phone = formData.ownerPhone;
    if (formData.is_whatsapp !== shop.is_whatsapp) changed.is_whatsapp = formData.is_whatsapp;
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
    if (formData.competitorImages.length) changed.competitor_images = formData.competitorImages.map((img) => img.file);
    if (formData.deletedCompetitorImages.length) changed.delete_competitor_images = formData.deletedCompetitorImages;
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
    if (formData.ownerPhone.length !== 11) {
      setPhoneError("Please enter a valid 11-digit phone number.");
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
      payload.append("is_whatsapp", formData.is_whatsapp ? "true" : "false");
      payload.append("shop_address", shopAddress);
      payload.append("latitude", roundedGps.lat);
      payload.append("longitude", roundedGps.lng);
      payload.append("accuracy", roundedGps.accuracy);

      if (changedFields.shop_image) payload.append("shop_image", changedFields.shop_image);
      if (changedFields.images) changedFields.images.forEach((img) => payload.append("images", img));
      if (changedFields.delete_images) payload.append("delete_images", JSON.stringify(changedFields.delete_images));
      if (changedFields.competitor_images) changedFields.competitor_images.forEach((img) => payload.append("competitor_images", img));
      if (changedFields.delete_competitor_images) payload.append("delete_competitor_images", JSON.stringify(changedFields.delete_competitor_images));
      if (changedFields.voice_notes) changedFields.voice_notes.forEach((blob) => payload.append("voice_notes", blob));
      if (changedFields.delete_voice_notes) payload.append("delete_voice_notes", JSON.stringify(changedFields.delete_voice_notes));
    } else {
      payload.append("shop_name", formData.name);
      payload.append("owner_name", formData.ownerName);
      payload.append("owner_phone", formData.ownerPhone);
      payload.append("is_whatsapp", formData.is_whatsapp ? "true" : "false");
      payload.append("shop_address", shopAddress);
      payload.append("latitude", roundedGps.lat);
      payload.append("longitude", roundedGps.lng);
      payload.append("accuracy", roundedGps.accuracy);
      if (formData.frontImage) payload.append("shop_image", formData.frontImage);
      formData.insideImages.forEach((img) => payload.append("images", img.file));
      if (formData.deletedInsideImages.length) payload.append("delete_images", JSON.stringify(formData.deletedInsideImages));
      formData.competitorImages.forEach((img) => payload.append("competitor_images", img.file));
      if (formData.deletedCompetitorImages.length) payload.append("delete_competitor_images", JSON.stringify(formData.deletedCompetitorImages));
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
    navigate("/salesman-dashboard/shops")
    // resetForm();
  } else {
    res = await api.post(
      `plants-mall-shops/api/shops/create/`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    dispatch(addShop(res.data));
    resetForm();
    navigate("/salesman-dashboard/shops")
  }

 toast.success(`Shop ${mode === "edit" ? "updated" : "registered"} successfully!`);
  
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

toast.error(errorMessages.join("\n"));
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
        <div className="">
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

     <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Basic Information
              </h3>
            </div>
            
            <div className="p-4 sm:p-5 space-y-4">
              {/* Shop Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="flex-1 min-w-0 px-4 py-3 text-sm bg-gray-50 border border-gray-200 
                             rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                             focus:border-green-500 focus:bg-white transition-all"
                    placeholder="Enter shop name"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput("name", false)}
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      recordingField === 'name' 
                        ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {recordingField === 'name' ? (
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                    ) : (
                      <Mic className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                    className="flex-1 min-w-0 px-4 py-3 text-sm bg-gray-50 border border-gray-200 
                             rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                             focus:border-green-500 focus:bg-white transition-all"
                    placeholder="Enter owner name"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput("ownerName", false)}
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      recordingField === 'ownerName' 
                        ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {recordingField === 'ownerName' ? (
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                    ) : (
                      <Mic className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Owner Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      handleChange({ target: { name: "ownerPhone", value: digitsOnly } });
                      setPhoneError("");
                    }}
                    required
                    className="flex-1 min-w-0 px-4 py-3 text-sm bg-gray-50 border border-gray-200 
                             rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                             focus:border-green-500 focus:bg-white transition-all"
                    placeholder="Phone Number"
                    maxLength="11"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput("ownerPhone", true)}
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      recordingField === 'ownerPhone' 
                        ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {recordingField === 'ownerPhone' ? (
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                    ) : (
                      <Mic className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                    {phoneError}
                  </p>
                )}
                
                {/* WhatsApp Checkbox */}
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_whatsapp}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_whatsapp: e.target.checked }))}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500/20"
                  />
                  <span className="text-sm text-gray-700">WhatsApp available on this number</span>
                </label>
              </div>
            </div>
          </div>

          {/* Front Image Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-sky-50">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Shop Front Image
              </h3>
            </div>
            
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input id="frontImageUpload" type="file" accept="image/*" onChange={handleFrontImageUpload} className="hidden" />
                <input id="frontImageCapture" type="file" accept="image/*" capture="environment" onChange={handleFrontImageUpload} className="hidden" />
                
                <label
                  htmlFor="frontImageUpload"
                  className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Upload</span>
                </label>
                
                <label
                  htmlFor="frontImageCapture"
                  className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Capture</span>
                </label>
              </div>
              
              {formData.frontImagePreview && (
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={formData.frontImagePreview}
                    alt="Shop front"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      Selected
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inside Images Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Inside Shop Images
              </h3>
            </div>
            
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input id="insideImagesUpload" type="file" accept="image/*" multiple onChange={handleInsideImagesUpload} className="hidden" />
                <input id="insideImageCapture" type="file" accept="image/*" capture="environment" onChange={handleInsideImageCapture} className="hidden" />
                
                <label
                  htmlFor="insideImagesUpload"
                  className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Upload</span>
                </label>
                
                <label
                  htmlFor="insideImageCapture"
                  className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Capture</span>
                </label>
              </div>

              {allInsideImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allInsideImages.map((image) => (
                    <div key={image.id} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={image.url}
                        alt="Inside shop"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeInsideImage(image)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Competitor Images Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Competitor Images
              </h3>
            </div>
            
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input id="competitorImagesUpload" type="file" accept="image/*" multiple onChange={handleCompetitorImagesUpload} className="hidden" />
                <input id="competitorImageCapture" type="file" accept="image/*" capture="environment" onChange={handleCompetitorImageCapture} className="hidden" />
                
                <label
                  htmlFor="competitorImagesUpload"
                  className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Upload</span>
                </label>
                
                <label
                  htmlFor="competitorImageCapture"
                  className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-600">Capture</span>
                </label>
              </div>

              {allCompetitorImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allCompetitorImages.map((image) => (
                    <div key={image.id} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={image.url}
                        alt="Competitor"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeCompetitorImage(image)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voice Notes Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Voice Notes (Optional)
              </h3>
            </div>
            
            <div className="p-4 sm:p-5">
              <VoiceNotesSection
                voiceNotes={formData.voiceNotes}
                setFormData={setFormData}
                initialVoiceNotes={formData.existingVoiceNotes}
                onDeleteExisting={handleDeleteExistingVoiceNote}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white rounded-2xl shadow-lg border border-gray-200/60 p-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 
                       rounded-xl font-bold text-base hover:from-green-700 hover:to-emerald-700 
                       disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                       transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              {loading
                ? mode === "edit" ? "Updating Shop..." : "Registering Shop..."
                : mode === "edit" ? "Update Shop" : "Register Shop"}
            </button>
          </div>
        </form>
    </div>
  );
};

export default ShopRegistration;