import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../../../store/slices/productsSlice";
import { Loader2, ArrowLeft, Package, ShoppingBag, Edit2 } from "lucide-react";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector((state) => state.products);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch]);

if (loading || !product) {
  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-500">Loading product details...</p>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gray-50/50 p-3 sm:p-4 md:p-6">
    <div className="max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        <button
          onClick={() => navigate(`/admin-dashboard/products/edit/${id}`)}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm font-medium"
        >
          <Edit2 className="h-4 w-4" />
          Edit Product
        </button>
      </div>

      {/* Product Hero Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-6">
        <div className="p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Product Image */}
            <div className="lg:w-80 flex-shrink-0">
              {product.image ? (
                <div className="relative group rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <Package className="h-16 w-16 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400">No Image Available</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 text-base leading-relaxed">
                  {product.description || "No description available for this product."}
                </p>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {product.variants_data?.length || 0} Variants
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-sm text-gray-500">Added:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(product.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                  product.is_active
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    product.is_active ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    product.is_active ? "text-green-700" : "text-red-700"
                  }`}>
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variants Section */}
      <div>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Product Variants
          </h2>
          <p className="text-sm text-gray-500">
            Different sizes and pricing options available
          </p>
        </div>

        {product.variants_data && product.variants_data.length > 0 ? (
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {product.variants_data.map((variant) => (
              <div
                key={variant.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Variant Header */}
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">
                      {variant.size} {variant.weight_unit}
                    </h3>
                    <div className="px-3 py-1 bg-green-100 rounded-full">
                      <span className="text-xs font-semibold text-green-700">
                        ID: {variant.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Loose Product Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Loose Product
                      </h4>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Price</p>
                          <p className="text-lg font-bold text-gray-900">
                            Rs {variant.loose?.price || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Stock</p>
                          <p className="text-lg font-bold text-gray-900">
                            {variant.loose?.stock || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cartons Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Carton Information
                      </h4>
                    </div>

                    {variant.cartons && variant.cartons.length > 0 ? (
                      <div className="space-y-3">
                        {variant.cartons.map((c) => (
                          <div
                            key={c.id}
                            className="bg-purple-50 rounded-xl p-4 border border-purple-100"
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Carton Price</p>
                                <p className="text-base font-bold text-gray-900">Rs {c.price}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Per Unit</p>
                                <p className="text-base font-bold text-gray-900">
                                  Rs {c.price_per_unit || "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Available</p>
                                <p className="text-base font-bold text-gray-900">{c.stock}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Pieces/Carton</p>
                                <p className="text-base font-bold text-gray-900">
                                  {c.pieces_per_carton}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Total Cartons</p>
                                <p className="text-base font-bold text-gray-900">
                                  {c.no_of_cartons_history}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                        <p className="text-sm text-gray-500">No cartons available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No variants added yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add product variants to start managing inventory
            </p>
            <button
              onClick={() => navigate(`/admin-dashboard/products/edit/${id}`)}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-medium"
            >
              Add Variants
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default ProductDetailsPage;