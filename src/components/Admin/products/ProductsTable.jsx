// src/components/Admin/products/ProductsTable.jsx
import { useState } from "react";

export default function ProductsTable({ products, page, setPage, pageSize }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const totalPages = Math.max(1, Math.ceil((products?.length || 0) / pageSize));

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "";

  const safeText = (value) =>
    typeof value === "string" || typeof value === "number" ? value : "";

  const safeImage = (product) =>
    typeof product.image === "string" ? product.image : null;

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-green-600 text-white uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-green-50 transition">
                <td className="px-4 py-3">
                  {safeImage(product) ? (
                    <img
                      src={safeImage(product)}
                      alt={safeText(product.name)}
                      className="w-14 h-14 object-cover rounded-lg border"
                    />
                  ) : (
                    <span className="text-gray-400 italic">No image</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {safeText(product.name)}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {safeText(product.price) ? `Rs ${product.price}` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {safeText(product.discount_price)
                    ? `Rs ${product.discount_price}`
                    : "—"}
                </td>
                <td className="px-4 py-3">{safeText(product.stock)}</td>
                <td className="px-4 py-3">{safeText(product.sku)}</td>
                <td className="px-4 py-3">{formatDate(product.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {products?.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg shadow bg-white p-3"
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleRow(product.id)}
            >
              <div className="flex items-center space-x-3">
                {safeImage(product) ? (
                  <img
                    src={safeImage(product)}
                    alt={safeText(product.name)}
                    className="w-12 h-12 object-cover rounded border"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded text-gray-400 text-xs">
                    No Img
                  </div>
                )}
                <h3 className="font-semibold text-gray-800">
                  {safeText(product.name)}
                </h3>
              </div>
              <span className="text-green-600 font-medium">
                {safeText(product.discount_price)
                  ? `Rs ${product.discount_price}`
                  : ""}
              </span>
            </div>

            {expandedRow === product.id && (
              <div className="mt-2 text-sm text-gray-700 space-y-1 border-t pt-2">
                <p>
                  <span className="font-medium">Stock:</span>{" "}
                  {safeText(product.stock)}
                </p>
                <p>
                  <span className="font-medium">SKU:</span>{" "}
                  {safeText(product.sku)}
                </p>
                <p>
                  <span className="font-medium">Created:</span>{" "}
                  {formatDate(product.created_at)}
                </p>
                {/* Cottons */}
                {Array.isArray(product.cottons) &&
                  product.cottons.map((c) => (
                    <p key={c.id}>
                      <span className="font-medium">{c.packing_unit}:</span> Rs{" "}
                      {c.price} | Stock: {c.stock}
                    </p>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50 disabled:bg-gray-400"
        >
          Prev
        </button>
        <span className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50 disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}
