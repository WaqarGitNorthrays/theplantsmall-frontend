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

  // --- UI ---
  if (loading || !formData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-purple-600 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-bold mb-6 text-green-700">Edit Shop</h2>

      {/* Shop Image */}
      <div className="mb-6">
        <p className="text-xl font-medium text-gray-500 mb-2">Shop Image</p>
        {formData.shop_image && (
          <img
            src={formData.shop_image}
            alt="Shop"
            className="w-full h-56 object-cover rounded-lg border mb-2"
          />
        )}
        <label className="flex items-center gap-2 px-3 py-2 w-fit rounded-lg bg-purple-50 border border-purple-200 text-purple-700 cursor-pointer hover:bg-purple-100">
          <Upload className="w-4 h-4" /> Upload New Shop Image
          <input
            type="file"
            accept="image/*"
            onChange={handleShopImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Extra Images */}
      <div className="mb-6">
        <p className="text-xl font-medium text-gray-500 mb-2">Extra Images</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {allInsideImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.url}
                alt="Shop extra"
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                onClick={() => removeInsideImage(img)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 px-3 py-2 mt-2 w-fit rounded-lg bg-green-50 border border-green-200 text-green-700 cursor-pointer hover:bg-green-100">
          <Upload className="w-4 h-4" /> Add Extra Images
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleInsideImagesUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Competitor Images */}
      <div className="mb-6">
        <p className="text-xl font-medium text-gray-500 mb-2">Competitor Images</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {allCompetitorImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.url}
                alt="Competitor"
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                onClick={() => removeCompetitorImage(img)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 px-3 py-2 mt-2 w-fit rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 cursor-pointer hover:bg-yellow-100">
          <Upload className="w-4 h-4" /> Add Competitor Images
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleCompetitorImagesUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Voice Notes */}
      <div className="mb-6">
        <p className="text-xl font-medium text-gray-500 mb-2">Voice Notes</p>
        <div className="flex flex-col gap-4">
          {(formData.voice_notes || []).map((note) => (
            <div key={note.id} className="flex items-center gap-3">
              <audio controls className="w-full">
                <source src={note.voice_note} type="audio/webm" />
              </audio>
              <button
                onClick={() => removeVoiceNote({ ...note, type: "existing" })}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
          {formData.voiceNotes.map((note) => (
            <div key={note.id} className="flex items-center gap-3">
              <audio controls className="w-full">
                <source src={note.preview} type="audio/webm" />
              </audio>
              <button
                onClick={() => removeVoiceNote(note)}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 cursor-pointer hover:bg-purple-100">
            <Upload className="w-4 h-4" /> Upload Voice Notes
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
            >
              <Mic className="w-4 h-4" /> Record Voice Note
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              <StopCircle className="w-4 h-4" /> Stop Recording
            </button>
          )}
        </div>
      </div>

      {/* Editable Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Shop Name</label>
          <input
            type="text"
            value={formData.shop_name || ""}
            onChange={(e) => handleChange("shop_name", e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Owner Name</label>
          <input
            type="text"
            value={formData.owner_name || ""}
            onChange={(e) => handleChange("owner_name", e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Owner Phone</label>
          <input
            type="text"
            value={formData.owner_phone || ""}
            onChange={(e) =>
              handleChange(
                "owner_phone",
                e.target.value.replace(/\D/g, "") // allow only numbers
              )
            }
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-white font-medium ${
            saving
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}