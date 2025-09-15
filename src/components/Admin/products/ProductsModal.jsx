import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addProduct, fetchProducts } from "../../../store/slices/productsSlice";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const AddProductModal = ({ onClose }) => {
  const dispatch = useDispatch();

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

        const productData = new FormData();

        // ✅ Ensure image is added as a File (not string)
        productData.append("name", formData.name);
        productData.append("description", formData.description);
        productData.append("discount_price", formData.discount_price);
        if (formData.image instanceof File) {
            productData.append("image", formData.image);
        }

        if (cottons.length > 0) {
            productData.append("cottons", JSON.stringify(cottons));
        }

        // Debugging - see what’s going in
        for (let [key, val] of productData.entries()) {
            console.log(key, val);
        }

        try {
            const result = await dispatch(addProduct(productData)).unwrap();
            toast.success("Product added successfully!");
            dispatch(fetchProducts());
            onClose();
        } catch (err) {
            toast.error(err?.message || "Failed to add product");
        }
        };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-green-700">
          Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
            rows="3"
          />

          {/* Discount Price */}
          <input
            type="number"
            name="discount_price"
            placeholder="Discount Price"
            value={formData.discount_price}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
          />

          {/* Image Upload */}
          <div>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded mt-2"
              />
            )}
          </div>

          {/* Cottons Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-green-700">Cottons</h3>
              <button
                type="button"
                onClick={() => setShowCottonForm(!showCottonForm)}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {showCottonForm ? "Cancel" : "Add Cotton"}
              </button>
            </div>

            {showCottonForm && (
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                <input
                  type="text"
                  name="packing_unit"
                  placeholder="Packing Unit (e.g. 25g)"
                  value={newCotton.packing_unit}
                  onChange={handleCottonChange}
                  className="w-full border px-3 py-2 rounded-lg"
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={newCotton.price}
                  onChange={handleCottonChange}
                  className="w-full border px-3 py-2 rounded-lg"
                />
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  value={newCotton.stock}
                  onChange={handleCottonChange}
                  className="w-full border px-3 py-2 rounded-lg"
                />
                <button
                  type="button"
                  onClick={addCotton}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Save Cotton
                </button>
              </div>
            )}

            {/* List of Cottons */}
            <div className="mt-3 space-y-2">
              {cottons.map((c, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm"
                >
                  <span>
                    {c.packing_unit} | Rs {c.price} | Stock: {c.stock}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCottons(cottons.filter((_, i) => i !== index))
                    }
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
