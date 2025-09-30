import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShopById } from "../../../store/slices/shopsSlice";
import { Loader2, X, ArrowLeft, Upload, Mic, StopCircle } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../../utils/axiosInstance";

// --- util: compute hash ---
async function computeHash(blob) {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function ShopEditPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedShop: shop, loading } = useSelector((state) => state.shops);

  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);

  // voice recording
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  // track object URLs to clean up
  const objectUrlsRef = useRef(new Set());

  // fetch shop
  useEffect(() => {
    if (shopId) dispatch(fetchShopById(shopId));
  }, [dispatch, shopId]);

  // populate formData
  useEffect(() => {
    if (shop) {
      setFormData({
        ...shop,
        shop_image_file: null,
        insideImages: [],
        deletedInsideImages: [],
        competitorImages: [],
        deletedCompetitorImages: [],
        voiceNotes: [],
        deletedVoiceNotes: [],
      });
    }
  }, [shop]);

  // cleanup URLs
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --- shop image ---
  const handleShopImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.shop_image?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.shop_image);
      objectUrlsRef.current.delete(formData.shop_image);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.add(objectUrl);

    setFormData((prev) => ({
      ...prev,
      shop_image_file: file,
      shop_image: objectUrl,
    }));
    e.target.value = "";
  };

  // --- inside images ---
  const addInsideImages = async (files) => {
    const newImages = [];
    for (const file of Array.from(files)) {
      const hash = await computeHash(file);
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(objectUrl);
      newImages.push({ id: hash, file, preview: objectUrl, type: "new" });
    }
    setFormData((prev) => ({
      ...prev,
      insideImages: [...prev.insideImages, ...newImages],
    }));
  };

  const handleInsideImagesUpload = (e) => {
    addInsideImages(e.target.files);
    e.target.value = "";
  };

  const removeInsideImage = (img) => {
    if (img.type === "existing") {
      setFormData((prev) => ({
        ...prev,
        deletedInsideImages: [...prev.deletedInsideImages, img.id],
        images: prev.images.filter((i) => i.id !== img.id),
      }));
    } else {
      if (img.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
        objectUrlsRef.current.delete(img.preview);
      }
      setFormData((prev) => ({
        ...prev,
        insideImages: prev.insideImages.filter((i) => i.id !== img.id),
      }));
    }
  };

  const allInsideImages = useMemo(() => {
    if (!formData) return [];
    const existing = (formData.images || []).map((img) => ({
      id: img.id,
      url: img.image,
      type: "existing",
    }));
    const newOnes = (formData.insideImages || []).map((img) => ({
      id: img.id,
      url: img.preview,
      type: "new",
    }));
    return [...existing, ...newOnes];
  }, [formData]);

  // --- competitor images ---
  const addCompetitorImages = async (files) => {
    const newImages = [];
    for (const file of Array.from(files)) {
      const hash = await computeHash(file);
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(objectUrl);
      newImages.push({ id: hash, file, preview: objectUrl, type: "new" });
    }
    setFormData((prev) => ({
      ...prev,
      competitorImages: [...prev.competitorImages, ...newImages],
    }));
  };

  const handleCompetitorImagesUpload = (e) => {
    addCompetitorImages(e.target.files);
    e.target.value = "";
  };

  const removeCompetitorImage = (img) => {
    if (img.type === "existing") {
      setFormData((prev) => ({
        ...prev,
        deletedCompetitorImages: [...prev.deletedCompetitorImages, img.id],
        competitor_images: prev.competitor_images.filter((i) => i.id !== img.id),
      }));
    } else {
      if (img.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
        objectUrlsRef.current.delete(img.preview);
      }
      setFormData((prev) => ({
        ...prev,
        competitorImages: prev.competitorImages.filter((i) => i.id !== img.id),
      }));
    }
  };

  const allCompetitorImages = useMemo(() => {
    if (!formData) return [];
    const existing = (formData.competitor_images || []).map((img) => ({
      id: img.id,
      url: img.image,
      type: "existing",
    }));
    const newOnes = (formData.competitorImages || []).map((img) => ({
      id: img.id,
      url: img.preview,
      type: "new",
    }));
    return [...existing, ...newOnes];
  }, [formData]);

  // --- voice notes ---
  const handleVoiceNotesUpload = (e) => {
    const files = Array.from(e.target.files);
    const newNotes = files.map((file) => {
      const preview = URL.createObjectURL(file);
      objectUrlsRef.current.add(preview);
      return {
        id: Math.random().toString(36).slice(2),
        blob: file,
        preview,
        type: "new",
      };
    });
    setFormData((prev) => ({
      ...prev,
      voiceNotes: [...prev.voiceNotes, ...newNotes],
    }));
    e.target.value = "";
  };

  const removeVoiceNote = (note) => {
    if (note.type === "existing") {
      setFormData((prev) => ({
        ...prev,
        deletedVoiceNotes: [...prev.deletedVoiceNotes, note.id],
        voice_notes: prev.voice_notes.filter((n) => n.id !== note.id),
      }));
    } else {
      if (note.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(note.preview);
        objectUrlsRef.current.delete(note.preview);
      }
      setFormData((prev) => ({
        ...prev,
        voiceNotes: prev.voiceNotes.filter((n) => n.id !== note.id),
      }));
    }
  };

  // --- voice recorder ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      recorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const preview = URL.createObjectURL(blob);
        objectUrlsRef.current.add(preview);

        const note = {
          id: Math.random().toString(36).slice(2),
          blob,
          preview,
          type: "new",
        };

        setFormData((prev) => ({
          ...prev,
          voiceNotes: [...prev.voiceNotes, note],
        }));
      };

      recorderRef.current.start();
      setRecording(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setRecording(false);
    }
  };

  // --- save ---
  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = new FormData();

      payload.append("shop_name", formData.shop_name);
      payload.append("owner_name", formData.owner_name);
      payload.append("owner_phone", formData.owner_phone);

      if (formData.shop_image_file)
        payload.append("shop_image", formData.shop_image_file);

      formData.insideImages.forEach((img) => {
        if (img.file) payload.append("images", img.file);
      });

      if (formData.deletedInsideImages.length)
        payload.append(
          "delete_images",
          JSON.stringify(formData.deletedInsideImages)
        );

      formData.competitorImages.forEach((img) => {
        if (img.file) payload.append("competitor_images", img.file);
      });

      if (formData.deletedCompetitorImages.length)
        payload.append(
          "delete_competitor_images",
          JSON.stringify(formData.deletedCompetitorImages)
        );

      formData.voiceNotes.forEach((n) => {
        if (n.blob) payload.append("voice_notes", n.blob);
      });

      if (formData.deletedVoiceNotes.length)
        payload.append(
          "delete_voice_notes",
          JSON.stringify(formData.deletedVoiceNotes)
        );

      await api.put(`plants-mall-shops/api/shops/${shopId}/edit/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData((prev) => ({
        ...prev,
        insideImages: [],
        deletedInsideImages: [],
        competitorImages: [],
        deletedCompetitorImages: [],
        voiceNotes: [],
        deletedVoiceNotes: [],
      }));

      toast.success("Shop updated successfully");
      navigate(`/admin-dashboard/shops/${shopId}`);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update shop");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-500">Loading shop details...</p>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-white rounded-xl p-3 sm:p-4 md:p-6">
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors group mb-4"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Shop Details
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Shop</h1>
            <p className="text-sm text-gray-500 mt-0.5">Update shop information and media</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-4 sm:mb-5">
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shop_name || ""}
                onChange={(e) => handleChange("shop_name", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name
              </label>
              <input
                type="text"
                value={formData.owner_name || ""}
                onChange={(e) => handleChange("owner_name", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Phone
              </label>
              <input
                type="tel"
                value={formData.owner_phone || ""}
                onChange={(e) =>
                  handleChange("owner_phone", e.target.value.replace(/\D/g, ""))
                }
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shop Main Image */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-4 sm:mb-5">
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-base font-semibold text-gray-900">Shop Image</h2>
          <p className="text-xs text-gray-500 mt-0.5">Main display image for the shop</p>
        </div>

        <div className="p-5">
          {formData.shop_image && (
            <div className="mb-4 relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={formData.shop_image}
                alt="Shop"
                className="w-full h-56 object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-full">
                  Current
                </span>
              </div>
            </div>
          )}
          
          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group">
            <Upload className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-green-600 transition-colors">
              Upload New Shop Image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleShopImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Extra Images */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-4 sm:mb-5">
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-sky-50">
          <h2 className="text-base font-semibold text-gray-900">Extra Images</h2>
          <p className="text-xs text-gray-500 mt-0.5">Additional shop interior/exterior photos</p>
        </div>

        <div className="p-5">
          {allInsideImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {allInsideImages.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={img.url}
                    alt="Extra"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeInsideImage(img)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors group">
            <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
              Add Extra Images
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleInsideImagesUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Competitor Images */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-4 sm:mb-5">
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
          <h2 className="text-base font-semibold text-gray-900">Competitor Images</h2>
          <p className="text-xs text-gray-500 mt-0.5">Photos of competitor products or stores</p>
        </div>

        <div className="p-5">
          {allCompetitorImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {allCompetitorImages.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={img.url}
                    alt="Competitor"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeCompetitorImage(img)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-orange-50 cursor-pointer transition-colors group">
            <Upload className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
              Add Competitor Images
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleCompetitorImagesUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Voice Notes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-4 sm:mb-5">
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-base font-semibold text-gray-900">Voice Notes</h2>
          <p className="text-xs text-gray-500 mt-0.5">Audio recordings about the shop</p>
        </div>

        <div className="p-5">
          {/* Existing Voice Notes */}
          {(formData.voice_notes || []).length > 0 && (
            <div className="space-y-3 mb-4">
              {formData.voice_notes.map((note, idx) => (
                <div key={note.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-600">{idx + 1}</span>
                  </div>
                  <audio controls className="flex-1 h-10">
                    <source src={note.voice_note} type="audio/webm" />
                  </audio>
                  <button
                    onClick={() => removeVoiceNote({ ...note, type: "existing" })}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Voice Notes */}
          {formData.voiceNotes.length > 0 && (
            <div className="space-y-3 mb-4">
              {formData.voiceNotes.map((note, idx) => (
                <div key={note.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-green-600">New</span>
                  </div>
                  <audio controls className="flex-1 h-10">
                    <source src={note.preview} type="audio/webm" />
                  </audio>
                  <button
                    onClick={() => removeVoiceNote(note)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload/Record Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-purple-50 cursor-pointer transition-colors group">
              <Upload className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                Upload Audio Files
              </span>
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleVoiceNotesUpload}
                className="hidden"
              />
            </label>

            {!recording ? (
              <button
                onClick={startRecording}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all font-medium"
              >
                <Mic className="w-5 h-5" />
                <span className="text-sm">Record Voice Note</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-medium animate-pulse"
              >
                <StopCircle className="w-5 h-5" />
                <span className="text-sm">Stop Recording</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 
                   rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 
                   disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2 transition-all
                   hover:shadow-lg hover:shadow-green-500/20"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving Changes...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
}