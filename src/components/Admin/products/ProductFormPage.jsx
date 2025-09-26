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
      <div className="p-10 text-center text-gray-600">
        <Loader2 className="animate-spin inline-block mr-2" />
        Loading product...
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-white rounded-2xl shadow-md p-6 max-w-4xl mx-auto">
         <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-emerald-700 font-medium text-sm transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </button>

        <h2 className="text-2xl font-bold mb-6 mt-3 text-emerald-600 border-b pb-3 border-gray-100">
          {id ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* --- Product Name --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400"
              required
            />
          </div>

          {/* --- Description --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="3"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

            {/* --- Product Status --- */}
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
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm shadow-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                {/* Custom dropdown icon */}
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

          {/* --- Image --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-3 w-32 h-32">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg border shadow-sm"
                />
              </div>
            )}
          </div>

          {/* --- Variants --- */}
          <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
            <h3 className="text-lg font-semibold text-emerald-700 mb-4">
              Variants
            </h3>

            {/* Add New Variant */}
            <div className="flex flex-wrap gap-3 mb-6 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={newVariant.size}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, size: e.target.value })
                  }
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400"
                />
              </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <div className="relative">
                    <select
                      value={newVariant.weight_unit}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, weight_unit: e.target.value })
                      }
                      className="w-full appearance-none border border-gray-300 px-4 py-2 pr-10 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400 text-gray-700"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    {/* custom dropdown arrow */}
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

              <button
                type="button"
                onClick={addVariant}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                <Plus size={18} /> Add Variant
              </button>
            </div>

            {/* Variant List */}
            {variants.length > 0 && (
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => openModal(i)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-gray-800 font-medium">
                        {v.size} {v.weight_unit}
                      </span>
                      <span className="text-gray-500 text-sm">
                        Loose: Rs {v.loose.price || 'N/A'} | Carton: Rs {v.cartons.price || 'N/A'}
                      </span>
                    </div>
                    {/* <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVariants(variants.filter((_, idx) => idx !== i));
                      }}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm transition-colors"
                    >
                      <Trash2 size={16} /> Delete
                    </button> */}
                  </div>
                ))}
              </div>
            )}
            {variants.length === 0 && (
              <p className="text-center text-gray-500 italic">No variants added yet.</p>
            )}
          </div>

          {/* --- Submit --- */}
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:bg-emerald-400 flex items-center justify-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {id ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>{id ? "Update Product" : "Add Product"}</>
            )}
          </button>
        </form>
      </div>

      {/* --- Variant Modal --- */}
      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl sm:h-auto md:h-auto h-3/4 overflow-auto">
            {activeIndex !== null && (
              <>
                <Dialog.Title className="text-lg font-semibold mb-4">
                  Edit Variant — {variants[activeIndex].size} {variants[activeIndex].weight_unit}
                </Dialog.Title>

                {/* Variant Details Section */}
                <div className="mb-5">
                  <h4 className="text-md font-medium mb-2">Variant Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">Size</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].size}
                        onChange={(e) =>
                          updateVariantField("size", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Unit</label>
                      <select
                        value={variants[activeIndex].weight_unit}
                        onChange={(e) =>
                          updateVariantField("weight_unit", e.target.value)
                        }
                        className="w-full border rounded-lg p-2"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Loose Section */}
                <div className="mb-5">
                  <h4 className="text-md font-medium mb-2">Loose Product</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600">Price</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].loose.price}
                        onChange={(e) =>
                          updateVariant("loose", "price", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Discount Price
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].loose.discount_value}
                        onChange={(e) =>
                          updateVariant("loose", "discount_value", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Stock</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].loose.stock}
                        onChange={(e) =>
                          updateVariant("loose", "stock", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Carton Section */}
                <div className="mb-5">
                  <h4 className="text-md font-medium mb-2">Carton</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600">
                        Pieces per Carton
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].cartons.pieces_per_carton}
                        onChange={(e) =>
                          updateVariant("cartons", "pieces_per_carton", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        No of Cartons
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].cartons.no_of_cartons_history}
                        onChange={(e) =>
                          updateVariant("cartons", "no_of_cartons_history", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Carton Price
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].cartons.price}
                        onChange={(e) =>
                          updateVariant("cartons", "price", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Carton Discount Price
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].cartons.discount_value}
                        onChange={(e) =>
                          updateVariant("cartons", "discount_value", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    onClick={closeModal}
                  >
                    Save
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