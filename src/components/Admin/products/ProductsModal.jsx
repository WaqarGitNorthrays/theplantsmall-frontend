import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addProduct, updateProduct, fetchProducts } from "../../../store/slices/productsSlice";
import { X, Plus, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const AddProductModal = ({ onClose, product }) => {
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_price: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [cottons, setCottons] = useState([]);
  const [newCotton, setNewCotton] = useState({
    packing_unit: "",
    price: "",
    stock: "",
  });
  const [showCottonForm, setShowCottonForm] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        discount_price: product.discount_price || "",
        image: null,
      });
      setImagePreview(product.image || null);
      setCottons(product.cottons || []);
    }
  }, [product]);

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

  const handleCottonChange = (e) => {
    const { name, value } = e.target;
    setNewCotton({ ...newCotton, [name]: value });
  };

  const addCotton = () => {
    if (!newCotton.packing_unit || !newCotton.price || !newCotton.stock) {
      toast.error("Please fill all cotton fields before adding.");
      return;
    }
    setCottons([...cottons, newCotton]);
    setNewCotton({ packing_unit: "", price: "", stock: "" });
    setShowCottonForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const productData = new FormData();
    productData.append("name", formData.name);
    productData.append("description", formData.description);
    productData.append("discount_price", formData.discount_price);

    if (formData.image instanceof File) {
      productData.append("image", formData.image);
    }

    if (cottons.length > 0) {
      productData.append("cottons", JSON.stringify(cottons));
    }

    try {
      if (product?.id) {
        await dispatch(updateProduct({ id: product.id, productData })).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await dispatch(addProduct(productData)).unwrap();
        toast.success("Product added successfully!");
      }

      dispatch(fetchProducts());
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative transform transition-all duration-300 scale-100 opacity-100 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          disabled={isSaving}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-emerald-600 border-b pb-3 border-gray-100">
          {product ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
              rows="3"
            />
          </div>

          {/* Discount Price */}
          <div>
            <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Price (Optional)
            </label>
            <input
              type="number"
              name="discount_price"
              id="discount_price"
              placeholder="e.g., 99.99"
              value={formData.discount_price}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all duration-200 cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-3 relative w-24 h-24">
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="w-full h-full object-cover rounded-lg shadow-md border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Cottons Section */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <details className="group" open={showCottonForm || (cottons.length > 0 && product)}>
              <summary
                className="flex justify-between items-center cursor-pointer text-lg font-semibold text-emerald-700 py-1"
                onClick={(e) => {
                  e.preventDefault();
                  setShowCottonForm(!showCottonForm);
                }}
              >
                <span>Cottons</span>
                <span className="transform transition-transform duration-200 group-open:rotate-180">
                  <ChevronDown size={20} />
                </span>
              </summary>
              <div className="mt-4 space-y-3">
                {showCottonForm && (
                  <div className="space-y-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-md font-medium text-gray-700">Add New Cotton Variety</h4>
                    <input
                      type="text"
                      name="packing_unit"
                      placeholder="Packing Unit (e.g., 25g)"
                      value={newCotton.packing_unit}
                      onChange={handleCottonChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm text-sm focus:ring-emerald-400 focus:border-emerald-400"
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Price"
                      value={newCotton.price}
                      onChange={handleCottonChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm text-sm focus:ring-emerald-400 focus:border-emerald-400"
                    />
                    <input
                      type="number"
                      name="stock"
                      placeholder="Stock"
                      value={newCotton.stock}
                      onChange={handleCottonChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm text-sm focus:ring-emerald-400 focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={addCotton}
                      className="w-full bg-emerald-600 text-white py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors duration-200"
                    >
                      Save Cotton
                    </button>
                  </div>
                )}
                {cottons.length > 0 && (
                  <div className="space-y-2">
                    {cottons.map((c, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shadow-sm"
                      >
                        <span className="text-gray-700 font-medium text-sm">
                          {c.packing_unit} | Rs {c.price} | Stock: {c.stock} pcs
                        </span>
                        <button
                          type="button"
                          onClick={() => setCottons(cottons.filter((_, i) => i !== index))}
                          className="mt-2 sm:mt-0 text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {!showCottonForm && !product && (
                  <p className="text-gray-500 text-sm italic text-center py-2">Click "Cottons" to add new varieties.</p>
                )}
              </div>
            </details>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-[1.01] shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {product ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                {product ? "Update Product" : "Add Product"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;