import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../../store/slices/productsSlice";
import { Loader2, Plus } from "lucide-react";
import AddProductModal from "./ProductsModal";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { products, loading, error, count } = useSelector(
    (state) => state.products
  );

  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    dispatch(fetchProducts({ page, pageSize }));
  }, [dispatch, page]);

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Products</h3>
        <div className="flex items-center gap-3">
          <p className="text-gray-600">Total Products: {count}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border">Image</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Discount Price</th>
                <th className="px-4 py-2 border">Stock</th>
                <th className="px-4 py-2 border">SKU</th>
                <th className="px-4 py-2 border">Weight (kg)</th>
                <th className="px-4 py-2 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-14 h-14 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2 border">{prod.name}</td>
                  <td className="px-4 py-2 border">{prod.description}</td>
                  <td className="px-4 py-2 border">Rs {prod.price}</td>
                  <td className="px-4 py-2 border text-green-600 font-semibold">
                    Rs {prod.discount_price}
                  </td>
                  <td className="px-4 py-2 border">{prod.stock}</td>
                  <td className="px-4 py-2 border">{prod.sku}</td>
                  <td className="px-4 py-2 border">{prod.weight_kg}</td>
                  <td className="px-4 py-2 border">
                    {new Date(prod.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default ProductsPage;
