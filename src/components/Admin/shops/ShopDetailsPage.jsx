// src/pages/admin/shops/ShopDetailsPage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchShopById } from "../../../store/slices/shopsSlice";
import { ArrowLeft, MapPin, Phone, User, Calendar, Store } from "lucide-react";
import { formatAddress } from "../../../utils/formatAddress";

const ShopDetailsPage = () => {
  const { shopId } = useParams();
  const dispatch = useDispatch();
  const { selectedShop: shop, loading, error } = useSelector(
    (state) => state.shops
  );

useEffect(() => {
  if (shopId) {
    dispatch(fetchShopById(shopId));
  }
}, [dispatch, shopId]);


  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-gray-500">Loading shop details...</span>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin-dashboard/shops"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shops
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Image */}
          {shop.shop_image || shop.images?.length > 0 ? (
            <img
              src={shop.shop_image || shop.images[0]?.image}
              alt={shop.shop_name}
              className="w-full md:w-72 h-56 object-cover rounded-lg border"
            />
          ) : (
            <div className="w-full md:w-72 h-56 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <Store className="h-12 w-12" />
            </div>
          )}

          {/* Right: Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {shop.shop_name}
            </h2>
            <p className="flex items-center text-gray-700 mt-2">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              Owner: {shop.owner_name || "N/A"}
            </p>
            <p className="flex items-center text-gray-700">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              {shop.owner_phone || "N/A"}
            </p>
            <p className="flex items-center text-gray-700">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              {formatAddress(shop.shop_address)}
            </p>
            <p className="flex items-center text-gray-700">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              Created:{" "}
              {shop.created_at
                ? new Date(shop.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Images */}
        {shop.images?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {shop.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.image}
                  alt={`Shop image ${idx + 1}`}
                  className="rounded-lg object-cover w-full h-32 border"
                />
              ))}
            </div>
          </div>
        )}

        {/* Voice Notes */}
        {shop.voice_notes?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Voice Notes
            </h3>
            <div className="space-y-3">
              {shop.voice_notes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg flex items-center justify-between"
                >
                  <span className="text-sm text-gray-500">
                    Note {idx + 1}
                  </span>
                  <audio controls className="h-8">
                    <source src={note.file} type="audio/mpeg" />
                    Your browser does not support audio.
                  </audio>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetailsPage;
