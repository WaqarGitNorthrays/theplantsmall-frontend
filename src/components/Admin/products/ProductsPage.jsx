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
    // No changes to the logic, data fetching remains the same.
    dispatch(fetchProducts({ page, pageSize }));
  }, [dispatch, page]);

  const totalPages = Math.ceil(count / pageSize);

  return (
    // The main container is adjusted with responsive padding (p-4 for small screens, p-6 for medium and up).
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header and Controls */}
      {/* This flex container now stacks vertically on small screens and becomes a row on larger screens. */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          Products
        </h3>
        {/* Controls are grouped together and wrap if needed on very small screens. */}
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-gray-500 text-sm font-medium">
            Total Products: <span className="font-semibold text-gray-800">{count}</span>
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

      {/* Products Table Wrapper */}
      {/* 
        This is the key change for responsiveness.
        The 'overflow-x-auto' class makes the container scrollable horizontally ONLY when the content (the table) is wider than the screen.
        This prevents the table from breaking the page layout on mobile devices.
      */}
      <div className="flex-grow overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-10 h-full">
            <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
          </div>
        ) : (
          <ProductsTable products={products} error={error} />
        )}
      </div>

      {/* Pagination */}
      {/* Pagination controls remain at the bottom, with sufficient spacing ensured by 'mt-auto'. */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
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

      {/* Add Product Modal (No changes needed for the modal trigger) */}
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default ProductsPage;