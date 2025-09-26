// src/pages/admin/shops/ShopDetailsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchShopById } from "../../../store/slices/shopsSlice";
import api from "../../../utils/axiosInstance";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Calendar,
  Store,
  Edit,
  X,
} from "lucide-react";
import { formatAddress } from "../../../utils/formatAddress";

const ShopDetailsPage = () => {
  const { shopId } = useParams();
  const dispatch = useDispatch();
  const { selectedShop: shop, loading, error } = useSelector(
    (state) => state.shops
  );

  const [activeTab, setActiveTab] = useState("details");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (shopId) {
      dispatch(fetchShopById(shopId));
    }
  }, [dispatch, shopId]);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // --- Image zoom handlers ---
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const newScale = Math.min(
      Math.max(0.5, scale + (e.deltaY < 0 ? zoomIntensity : -zoomIntensity)),
      5
    );
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    }
  };
  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.current.x,
      y: e.touches[0].clientY - dragStart.current.y,
    });
  };
  const handleTouchEnd = () => setIsDragging(false);

  // --- Update shop status ---
  const handleToggleStatus = async () => {
    if (!shop) return;
    setUpdatingStatus(true);
    try {
      const newStatus = shop.status === "open" ? "close" : "open";
      await api.patch(
        `/plants-mall-shops/api/shops/${shopId}/edit/`,
        { status: newStatus }
      );
      dispatch(fetchShopById(shopId));
    } catch (err) {
      console.error("Error updating shop status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-gray-500 animate-pulse">
          Loading shop details...
        </span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-6">{error}</p>;
  }

  if (!shop) {
    return <p className="text-center text-gray-500 py-6">Shop not found</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white rounded-2xl shadow-md border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/admin-dashboard/shops"
          className="flex items-center text-sm text-gray-600 hover:text-green-600 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shops
        </Link>

        <div className="flex gap-3">
          <Link
            to={`/admin-dashboard/shops/${shopId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition"
          >
            <Edit className="h-4 w-4" /> Edit Shop
          </Link>
          <button
            onClick={handleToggleStatus}
            disabled={updatingStatus}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              shop.status === "open"
                ? "bg-red-500 text-white hover:bg-orange-800"
                : "bg-purple-800 text-white hover:bg-purple-900"
            }`}
          >
            {updatingStatus
              ? "Updating..."
              : shop.status === "open"
              ? "Close Shop"
              : "Open Shop"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["details", "images", "competitorImages","voices"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition ${
              activeTab === tab
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "details" && "Details"}
            {tab === "images" && "Images"}
            {tab === "competitorImages" && "Competitor"}
            {tab === "voices" && "Voice Notes"}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image */}
            {shop.shop_image || shop.images?.length > 0 ? (
              <img
                src={shop.shop_image || shop.images[0]?.image}
                alt={shop.shop_name}
                className="w-full md:w-72 h-56 object-cover rounded-xl border cursor-pointer"
                onClick={() => {
                  setLightboxImage(shop.shop_image || shop.images[0]?.image);
                  resetZoom();
                }}
              />
            ) : (
              <div className="w-full md:w-72 h-56 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                <Store className="h-12 w-12" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {shop.shop_name}
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-medium">Owner:</span>{" "}
                  {shop.owner_name || "N/A"}
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-green-500" />
                  {shop.owner_phone || "N/A"}
                </p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-500" />
                  {formatAddress(shop.shop_address)}
                </p>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-green-500" />
                  Created:{" "}
                  {shop.created_at
                    ? new Date(shop.created_at).toLocaleDateString()
                    : "—"}
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-lg font-medium ${
                      shop.status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {shop.status || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "images" && (
          <div>
            {shop.images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {shop.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.image}
                    alt={`Shop image ${idx + 1}`}
                    onClick={() => {
                      setLightboxImage(img.image);
                      resetZoom();
                    }}
                    className="rounded-xl object-cover w-full h-32 border cursor-pointer hover:scale-105 transition"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No images available.</p>
            )}
          </div>
        )}

        {activeTab === "competitorImages" && (
          <div>
            {shop.competitor_images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {shop.competitor_images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.image}
                    alt={`Shop image ${idx + 1}`}
                    onClick={() => {
                      setLightboxImage(img.image);
                      resetZoom();
                    }}
                    className="rounded-xl object-cover w-full h-32 border cursor-pointer hover:scale-105 transition"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No images available.</p>
            )}
          </div>
        )}

        {activeTab === "voices" && (
          <div>
            {shop.voice_notes?.length > 0 ? (
              <div className="space-y-4">
                {shop.voice_notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl flex items-center justify-between bg-green-50 hover:bg-green-100 transition"
                  >
                    <audio
                      controls
                      className="h-10 w-100 sm:w-72 md:w-96 rounded-lg"
                    >
                      <source src={note.voice_note} type="audio/mpeg" />
                      Your browser does not support audio.
                    </audio>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No voice notes available.</p>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={lightboxImage}
            alt="Full view"
            className="max-h-[90vh] max-w-[90vw] object-contain cursor-move select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.2s ease",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
};

export default ShopDetailsPage;
