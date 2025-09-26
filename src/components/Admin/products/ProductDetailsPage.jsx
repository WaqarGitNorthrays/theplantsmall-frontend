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
      <div className="flex justify-center items-center h-[80vh] text-gray-600">
        <Loader2 className="animate-spin mr-3 w-8 h-8" />
        <span className="text-lg font-medium">Loading product...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-8 sm:p-12 max-w-7xl mx-auto min-h-screen bg-white rounded-lg">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </button>
        <button
          onClick={() => navigate(`/admin-dashboard/products/edit/${id}`)}
          className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Product
        </button>
      </div>

      {/* Product Header */}
      <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col lg:flex-row gap-8 items-start">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-64 h-64 object-cover rounded-2xl border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-2xl border border-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 mt-3 text-base leading-relaxed">
            {product.description || "No description available."}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Added: {new Date(product.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
                <p className="flex items-center mt-2">
                  <span className="font-medium mr-2">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-lg font-medium ${
                      product.is_active === true
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {product.is_active === false ? "False" : "True"}
                  </span>
                </p>
        </div>
      </div>

      {/* Variants Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-6">
          Product Variants
        </h2>
        {product.variants_data && product.variants_data.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {product.variants_data.map((variant) => (
              <div
                key={variant.id}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Variant Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-emerald-600">
                    {variant.size} {variant.weight_unit}
                  </h3>
                </div>

                {/* Loose Section */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <ShoppingBag className="w-5 h-5 text-emerald-500 mr-2" />
                    <span className="font-medium text-gray-800">Loose Product</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Price:</span>{" "}
                      <span className="text-emerald-600 font-semibold">
                        Rs {variant.loose?.price || "-"}
                      </span>
                    </p>
                    {/* <p>
                      <span className="font-medium">Discount:</span>{" "}
                      <span className="text-emerald-600 font-semibold">
                        {variant.loose?.discount_value || "-"}
                      </span>
                    </p> */}
                    <p>
                      <span className="font-medium">Stock:</span>{" "}
                      <span className="text-emerald-600 font-semibold">
                        {variant.loose?.stock || "-"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Cartons Section */}
                <div>
                  <div className="flex items-center mb-3">
                    <Package className="w-5 h-5 text-emerald-500 mr-2" />
                    <span className="font-medium text-gray-800">Cartons</span>
                  </div>
                  {variant.cartons && variant.cartons.length > 0 ? (
                    <div className="space-y-4">
                      {variant.cartons.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <p>
                              <span className="font-medium">Price:</span>{" "}
                              <span className="text-emerald-600 font-semibold">Rs {c.price}</span>
                            </p>
                            {/* <p>
                              <span className="font-medium">Discount:</span>{" "}
                              <span className="text-emerald-600 font-semibold">
                                {c.discount_value || "-"}
                              </span>
                            </p> */}
                            <p>
                              <span className="font-medium">Per unit price:</span>{" "}
                              <span className="text-emerald-600 font-semibold">
                                {c.price_per_unit || "-"}
                              </span>
                            </p>
                            <p>
                              <span className="font-medium">Available Cartons:</span>{" "}
                              <span className="text-emerald-600 font-semibold">{c.stock}</span>
                            </p>
                            <p>
                              <span className="font-medium">Pieces per Carton:</span>{" "}
                              <span className="text-emerald-600 font-semibold">
                                {c.pieces_per_carton}
                              </span>
                            </p>
                            <p>
                              <span className="font-medium">Total Cartons:</span>{" "}
                              <span className="text-emerald-600 font-semibold">
                                {c.no_of_cartons_history}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No cartons available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-500">
            No variants added yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;