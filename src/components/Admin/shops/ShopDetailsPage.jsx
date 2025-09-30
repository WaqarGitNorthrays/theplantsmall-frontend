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
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-500">Loading shop details...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-12 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">⚠</span>
          </div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    </div>
  );
}

if (!shop) {
  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Shop not found</h3>
          <p className="text-sm text-gray-500">The shop you're looking for doesn't exist</p>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gray-50/50 p-3 sm:p-4 md:p-6">
    <div className="max-w-[1400px] mx-auto">
      {/* Header Bar */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          to="/admin-dashboard/shops"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Shops
        </Link>

        <div className="flex gap-2 sm:gap-3">
          <Link
            to={`/admin-dashboard/shops/${shopId}/edit`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium transition-all hover:shadow-lg hover:shadow-green-500/20"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Shop</span>
          </Link>
          <button
            onClick={handleToggleStatus}
            disabled={updatingStatus}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              shop.status === "open"
                ? "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20"
                : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/20"
            }`}
          >
            {updatingStatus ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Updating...</span>
              </>
            ) : (
              <>
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {shop.status === "open" ? "Close Shop" : "Open Shop"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-100 bg-white">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { key: "details", label: "Details" },
              { key: "images", label: "Images" },
              { key: "competitorImages", label: "Competitor" },
              { key: "voices", label: "Voice Notes" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Image */}
                <div className="lg:w-96 flex-shrink-0">
                  {shop.shop_image || shop.images?.length > 0 ? (
                    <div
                      onClick={() => {
                        setLightboxImage(shop.shop_image || shop.images[0]?.image);
                        resetZoom();
                      }}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <img
                        src={shop.shop_image || shop.images[0]?.image}
                        alt={shop.shop_name}
                        className="w-full h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm font-medium text-gray-900">Click to view</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
                      <Store className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-6">
                  {/* Title & Status */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {shop.shop_name}
                      </h1>
                      <span
                        className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border ${
                          shop.status === "open"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {shop.status === "open" ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid gap-4">
                    {/* Owner */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-0.5">Owner</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {shop.owner_name || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-0.5">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {shop.owner_phone || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-0.5">Address</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {formatAddress(shop.shop_address)}
                        </p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-0.5">Registered</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {shop.created_at
                            ? new Date(shop.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "images" && (
            <div>
              {shop.images?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {shop.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setLightboxImage(img.image);
                        resetZoom();
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                    >
                      <img
                        src={img.image}
                        alt={`Shop image ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No images available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "competitorImages" && (
            <div>
              {shop.competitor_images?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {shop.competitor_images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setLightboxImage(img.image);
                        resetZoom();
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                    >
                      <img
                        src={img.image}
                        alt={`Competitor image ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No competitor images available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "voices" && (
            <div>
              {shop.voice_notes?.length > 0 ? (
                <div className="space-y-3">
                  {shop.voice_notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-sm transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-green-600">
                          {idx + 1}
                        </span>
                      </div>
                      <audio
                        controls
                        className="flex-1 h-10 rounded-lg"
                        style={{ maxWidth: "600px" }}
                      >
                        <source src={note.voice_note} type="audio/mpeg" />
                        Your browser does not support audio.
                      </audio>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No voice notes available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Lightbox Modal */}
    {lightboxImage && (
      <div
        className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => setLightboxImage(null)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={() => setScale(Math.min(scale + 0.5, 5))}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors backdrop-blur-sm"
          >
            Zoom In
          </button>
          <button
            onClick={() => setScale(Math.max(scale - 0.5, 0.5))}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors backdrop-blur-sm"
          >
            Zoom Out
          </button>
          <button
            onClick={resetZoom}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors backdrop-blur-sm"
          >
            Reset
          </button>
        </div>

        <img
          src={lightboxImage}
          alt="Full view"
          className="max-h-[85vh] max-w-[85vw] object-contain cursor-move select-none rounded-lg shadow-2xl"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.2s ease",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          draggable={false}
        />
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
          Scroll to zoom • Drag to pan
        </div>
      </div>
    )}
  </div>
);
};

export default ShopDetailsPage;
