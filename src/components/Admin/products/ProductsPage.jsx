import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../../store/slices/productsSlice";
import { Loader2, Plus } from "lucide-react";
import AddProductModal from "./ProductsModal";
import ProductsTable from "./ProductsTable";

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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
          Products
        </h3>
        <div className="flex items-center gap-3">
          <p className="text-gray-500 text-sm font-medium">
            Total Products: <span className="font-semibold">{count}</span>
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table/Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-10 flex-grow">
          <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
        </div>
      ) : (
        <ProductsTable products={products} error={error} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 py-2 border-t border-gray-100">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
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