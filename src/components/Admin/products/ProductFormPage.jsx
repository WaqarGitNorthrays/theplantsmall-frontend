import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addProduct,
  updateProduct,
  fetchProducts,
  fetchProductById,
} from "../../../store/slices/productsSlice";
import { Trash2, Loader2, Plus, ChevronDown, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog } from "@headlessui/react";

const UNITS = ["g", "kg", "ml", "L"];

const ProductFormPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { product, loading } = useSelector((state) => state.products);

  const [isSaving, setIsSaving] = useState(false);

  // --- Product Info ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    is_active: true,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // --- Variants ---
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({
    size: "",
    weight_unit: "g",
    loose: { price: "", discount_value: "", stock: "" },
    cartons: { pieces_per_carton: "", no_of_cartons_history: "", price: "", discount_value: "" },
  });

  // --- Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  // --- Fetch product if edit mode ---
  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  // --- Populate form if editing ---
  useEffect(() => {
    if (id && product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        image: null,
        is_active: product.is_active !== undefined ? product.is_active : true,
      });
      setImagePreview(product.image || null);

      const loadedVariants = (product.variants_data || []).map((v) => ({
        id: v.id,
        size: v.size,
        weight_unit: v.weight_unit,
        loose: v.loose ? { ...v.loose } : { price: "", discount_value: "", stock: "" },
        cartons: v.cartons[0]
          ? {
              id: v.cartons[0].id,
              pieces_per_carton: v.cartons[0].pieces_per_carton || "",
              no_of_cartons_history: v.cartons[0].no_of_cartons_history || v.cartons[0].stock || "",
              price: v.cartons[0].price || "",
              discount_value: v.cartons[0].discount_value || "",
              packing_unit: v.cartons[0].packing_unit || "",
            }
          : {
              pieces_per_carton: "",
              no_of_cartons_history: "",
              price: "",
              discount_value: "",
              packing_unit: "",
            },
      }));
      setVariants(loadedVariants);
    }
  }, [product, id]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addVariant = () => {
    if (!newVariant.size) {
      toast.error("Enter a size before adding variant");
      return;
    }
    setVariants([...variants, { ...newVariant }]);
    setNewVariant({
      size: "",
      weight_unit: "g",
      loose: { price: "", discount_value: "", stock: "" },
      cartons: { pieces_per_carton: "", no_of_cartons_history: "", price: "", discount_value: "", packing_unit: "" },
    });
  };

  const openModal = (index) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setActiveIndex(null);
    setIsModalOpen(false);
  };

  const updateVariant = (section, field, value) => {
    const updated = [...variants];
    updated[activeIndex][section][field] = value;
    setVariants(updated);
  };

  const updateVariantField = (field, value) => {
    const updated = [...variants];
    updated[activeIndex][field] = value;
    setVariants(updated);
  };

  // Helper function to filter out empty fields
  const filterNonEmptyFields = (obj) => {
    const filtered = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] !== "" && obj[key] != null) {
        filtered[key] = obj[key];
      }
    });
    return Object.keys(filtered).length > 0 ? filtered : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const productData = new FormData();
    productData.append("name", formData.name);
    if (formData.description) productData.append("description", formData.description);
    if (formData.image instanceof File) {
      productData.append("image", formData.image);
    }
    productData.append("is_active", formData.is_active);


    // Variants payload - only include non-empty fields
    if (variants.length > 0) {
      const variantsWithStock = variants
        .map((v) => {
          const variant = {
            ...(v.id && { id: v.id }),
            size: v.size,
            weight_unit: v.weight_unit,
          };

          // Include loose only if it has non-empty fields
          const filteredLoose = filterNonEmptyFields(v.loose);
          if (filteredLoose) {
            variant.loose = filteredLoose;
          }

          // Include cartons only if it has non-empty fields
          const filteredCartons = filterNonEmptyFields({
            id: v.cartons.id,
            packing_unit: v.cartons.packing_unit,
            price: v.cartons.price,
            discount_value: v.cartons.discount_value,
            stock: v.cartons.no_of_cartons_history,
            pieces_per_carton: v.cartons.pieces_per_carton,
            no_of_cartons_history: v.cartons.no_of_cartons_history,
            price_per_unit:
            v.cartons.price && v.cartons.pieces_per_carton
              ? (parseFloat(v.cartons.price) / parseFloat(v.cartons.pieces_per_carton)).toFixed(2)
              : null,
          });

          if (filteredCartons) {
            variant.cartons = [filteredCartons];
          }

          // Only return variant if it has either loose or cartons
          return Object.keys(variant).length > 2 ? variant : null;
        })
        .filter((v) => v !== null); // Remove null variants

      if (variantsWithStock.length > 0) {
        productData.append("variants", JSON.stringify(variantsWithStock));
      }
    }

    try {
      if (id) {
        await dispatch(updateProduct({ id, productData })).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await dispatch(addProduct(productData)).unwrap();
        toast.success("Product added successfully!");
      }

      dispatch(fetchProducts());
      navigate("/admin-dashboard/products");
    } catch (err) {
      // Handle backend errors
      if (err && typeof err === "object") {
        Object.keys(err).forEach((key) => {
          const errorMessage = Array.isArray(err[key]) ? err[key].join(", ") : err[key];
          toast.error(`${key}: ${errorMessage}`);
        });
      } else {
        toast.error(err?.message || "Failed to save product");
      }
    } finally {
      setIsSaving(false);
    }
  };
if (id && loading) {
  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-500">Loading product...</p>
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
          Back to Products
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {id ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {id ? "Update product information and variants" : "Create a new product with variants"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Basic Information Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="p-5 space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200 
                         placeholder:text-gray-400"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="3"
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                         focus:border-green-500 focus:bg-white transition-all duration-200 
                         placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Status
              </label>
              <div className="relative">
                <select
                  name="is_active"
                  value={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.value === "true" })
                  }
                  className="w-full appearance-none px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 
                           rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 
                           focus:border-green-500 focus:bg-white transition-all duration-200 
                           cursor-pointer pr-10"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 p-2">
                      <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {imagePreview && (
                  <div className="relative w-32 h-32 flex-shrink-0 group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Preview</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-base font-semibold text-gray-900">Product Variants</h2>
            <p className="text-xs text-gray-500 mt-0.5">Add different sizes and pricing options</p>
          </div>

          <div className="p-5 space-y-5">
            {/* Add New Variant */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Variant</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={newVariant.size}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, size: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 
                             rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                             focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Unit
                  </label>
                  <div className="relative">
                    <select
                      value={newVariant.weight_unit}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, weight_unit: e.target.value })
                      }
                      className="w-full appearance-none px-3 py-2 text-sm bg-white border border-gray-200 
                               rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                               focus:border-green-500 transition-all pr-8"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addVariant}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium 
                             flex items-center justify-center gap-2 hover:bg-green-700 
                             transition-all hover:shadow-lg hover:shadow-green-500/20"
                  >
                    <Plus size={16} /> Add Variant
                  </button>
                </div>
              </div>
            </div>

            {/* Variant List */}
            {variants.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Added Variants ({variants.length})</h3>
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => openModal(i)}
                      className="group flex items-center justify-between p-4 border border-gray-200 
                               rounded-xl bg-white hover:bg-gray-50 hover:border-green-200 
                               cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                          <span className="text-sm font-bold text-green-600">
                            {v.size}
                            <span className="text-xs">{v.weight_unit}</span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {v.size} {v.weight_unit}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              Loose: Rs {v.loose.price || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              Carton: Rs {v.cartons.price || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 flex-shrink-0 group-hover:text-green-600 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No variants added yet</p>
                <p className="text-xs text-gray-400 mt-1">Add a variant using the form above</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 
                     rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 
                     disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2 transition-all
                     hover:shadow-lg hover:shadow-green-500/20"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {id ? "Updating Product..." : "Saving Product..."}
              </>
            ) : (
              <>
                {id ? "Update Product" : "Add Product"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>

    {/* Variant Edit Modal */}
    <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl max-h-[85vh] overflow-auto rounded-2xl bg-white shadow-2xl">
          {activeIndex !== null && (
            <>
              {/* Modal Header */}
              <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <Dialog.Title className="text-lg font-bold text-gray-900">
                  Edit Variant — {variants[activeIndex].size} {variants[activeIndex].weight_unit}
                </Dialog.Title>
                <p className="text-xs text-gray-500 mt-1">Update pricing and stock information</p>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Variant Details */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Variant Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Size</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 
                                 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                 focus:border-green-500 transition-all"
                        value={variants[activeIndex].size}
                        onChange={(e) => updateVariantField("size", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Unit</label>
                      <div className="relative">
                        <select
                          value={variants[activeIndex].weight_unit}
                          onChange={(e) => updateVariantField("weight_unit", e.target.value)}
                          className="w-full appearance-none px-3 py-2 text-sm bg-white border border-gray-200 
                                   rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                   focus:border-green-500 transition-all pr-8"
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loose Product */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Loose Product</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Price</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 
                                 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                 focus:border-green-500 transition-all"
                        value={variants[activeIndex].loose.price}
                        onChange={(e) => updateVariant("loose", "price", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Discount</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 
                                 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                 focus:border-green-500 transition-all"
                        value={variants[activeIndex].loose.discount_value}
                        onChange={(e) => updateVariant("loose", "discount_value", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Stock</label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 
                                 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                 focus:border-green-500 transition-all"
                        value={variants[activeIndex].loose.stock}
                        onChange={(e) => updateVariant("loose", "stock", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Carton */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Carton Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Pieces per Carton</label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 
                                 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                 focus:border-green-500 transition-all"
                        value={variants[activeIndex].cartons.pieces_per_carton}
                        onChange={(e) => updateVariant("cartons", "pieces_per_carton", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">No of Cartons</label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 
                                 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                 focus:border-green-500 transition-all"
                        value={variants[activeIndex].cartons.no_of_cartons_history}
                        onChange={(e) => updateVariant("cartons", "no_of_cartons_history", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Carton Price</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 
                                 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                 focus:border-green-500 transition-all"
                        value={variants[activeIndex].cartons.price}
                        onChange={(e) => updateVariant("cartons", "price", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Carton Discount</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 
                                 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 
                                 focus:border-green-500 transition-all"
                        value={variants[activeIndex].cartons.discount_value}
                        onChange={(e) => updateVariant("cartons", "discount_value", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium 
                           text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold 
                           hover:bg-green-700 transition-all hover:shadow-lg hover:shadow-green-500/20"
                  onClick={closeModal}
                >
                  Save Changes
                </button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  </div>
);
};

export default ProductFormPage;