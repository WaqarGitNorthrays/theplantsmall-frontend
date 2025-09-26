import React from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductsTable = ({ products, error }) => {
  const navigate = useNavigate();

  if (error) {
    return (
      <p className="text-red-500 text-center py-12 text-lg font-medium">
        Error: {error}
      </p>
    );
  }
  if (!products || products.length === 0) {
    return (
      <p className="text-gray-500 text-center py-12 text-lg font-medium">
        No products found.
      </p>
    );
  }

  return (
    <div className="">
      {/* Desktop Table */}
      <div className="overflow-x-auto hidden md:block bg-white rounded-2xl shadow-lg border border-gray-100">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-4 border-b font-medium">Image</th>
              <th className="px-6 py-4 border-b font-medium">Name</th>
              <th className="px-6 py-4 border-b font-medium">Description</th>
              <th className="px-6 py-4 border-b font-medium">SKU</th>
              <th className="px-6 py-4 border-b font-medium">Created At</th>
              <th className="px-6 py-4 border-b font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr
                key={prod.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 border-b">
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 border-b font-semibold text-gray-800">
                  {prod.name}
                </td>
                <td className="px-6 py-4 border-b text-gray-600 truncate max-w-xs">
                  {prod.description || "No description"}
                </td>
                <td className="px-6 py-4 border-b text-gray-600">
                  {prod.sku || "-"}
                </td>
                <td className="px-6 py-4 border-b text-gray-600">
                  {new Date(prod.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={() => navigate(`/admin-dashboard/products/${prod.id}`)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors duration-200"
                  >
                    <Eye size={16} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Cards */}
      <div className="space-y-6 md:hidden">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl shadow-md p-2 sm:p-4 md:p-4 border border-gray-100 transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {prod.image ? (
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg leading-tight">{prod.name}</h4>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">SKU:</span> {prod.sku || "-"}
                </p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  <span className="font-medium">Description:</span>{" "}
                  {prod.description || "No description"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Added: {new Date(prod.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => navigate(`/admin-dashboard/products/${prod.id}`)}
                className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition-colors duration-200"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsTable;