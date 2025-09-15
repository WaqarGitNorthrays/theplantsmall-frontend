// src/components/products/ProductForm.jsx
import { useState } from "react";

export default function ProductForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: "", price: "", category: "", stock: "" }); // reset form
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Product Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium mb-1">Stock</label>
        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
      >
        Save Product
      </button>
    </form>
  );
}
