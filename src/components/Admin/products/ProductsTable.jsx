import React, { useState } from "react";
import { ChevronDown, ChevronUp, Edit } from "lucide-react";
import AddProductModal from "./ProductsModal";

const ProductsTable = ({ products, error }) => {
  const [expanded, setExpanded] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };
  const closeModal = () => {
    setEditingProduct(null);
    setShowModal(false);
  };

  if (error) {
    return <p className="text-red-500 text-center py-10 text-lg font-medium">Error: {error}</p>;
  }
  if (!products || products.length === 0) {
    return <p className="text-gray-400 text-center py-10 text-lg font-medium">No products found.</p>;
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full border border-gray-200 rounded-lg text-sm text-left overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b border-r text-gray-500">Image</th>
              <th className="px-4 py-3 border-b border-r text-gray-500">Name</th>
              <th className="px-4 py-3 border-b border-r text-gray-500">Description</th>
              <th className="px-4 py-3 border-b border-r text-gray-500">Discount Price</th>
              <th className="px-4 py-3 border-b border-r text-gray-500">SKU</th>
              <th className="px-4 py-3 border-b border-r text-gray-500">Created At</th>
              <th className="px-4 py-3 border-b border-r text-gray-500">Cartons</th>
              <th className="px-4 py-3 border-b text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <React.Fragment key={prod.id}>
                <tr className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-2 border-r border-b">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-4 py-2 border-r border-b font-medium text-gray-700">{prod.name}</td>
                  <td className="px-4 py-2 border-r border-b text-gray-500">{prod.description}</td>
                  <td className="px-4 py-2 border-r border-b font-semibold text-green-600">
                    {prod.discount_price && prod.discount_price !== "0.00"
                      ? `Rs ${prod.discount_price}`
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border-r border-b text-gray-500">{prod.sku}</td>
                  <td className="px-4 py-2 border-r border-b text-gray-500">
                    {new Date(prod.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border-r border-b text-center">
                    {prod.cottons?.length > 0 ? (
                      <button
                        onClick={() => toggleExpand(prod.id)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        {expanded[prod.id] ? (
                          <>
                            Hide <ChevronUp size={16} />
                          </>
                        ) : (
                          <>
                            View <ChevronDown size={16} />
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-gray-400">No Cartons</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => handleEdit(prod)}
                      className="flex items-center gap-1 text-white bg-emerald-500 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-600 transition-colors"
                    >
                      <Edit size={14} /> Edit
                    </button>
                  </td>
                </tr>

                {/* Expanded cottons row */}
                {expanded[prod.id] && prod.cottons?.length > 0 && (
                  <tr className="bg-gray-50">
                    <td colSpan="9" className="px-4 py-3 border-b">
                      <div className="overflow-x-auto rounded-lg">
                        <table className="min-w-full border text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 border-r text-gray-500">Packing Unit</th>
                              <th className="px-3 py-2 border-r text-gray-500">Price</th>
                              <th className="px-3 py-2 text-gray-500">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prod.cottons.map((c) => (
                              <tr key={c.id} className="hover:bg-white">
                                <td className="px-3 py-1 border-r text-gray-600">{c.packing_unit}</td>
                                <td className="px-3 py-1 border-r text-gray-600">Rs {c.price}</td>
                                <td className="px-3 py-1 text-gray-600">{c.stock} pcs</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Cards */}
      <div className="space-y-4 md:hidden">
        {products.map((prod) => (
          <div key={prod.id} className="border border-gray-200 rounded-xl shadow-sm p-4 bg-white transition-all duration-300 transform hover:shadow-md">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-grow truncate overflow-hidden whitespace-nowrap">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 truncate overflow-hidden whitespace-nowrap max-w-full">{prod.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">SKU: {prod.sku}</p>
                  <p className="mt-2 text-sm font-medium text-green-600">
                    {prod.discount_price && prod.discount_price !== "0.00"
                      ? `Rs ${prod.discount_price}`
                      : "No Discount"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleEdit(prod)}
                className="flex-shrink-0 bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 transition-colors"
              >
                <Edit size={16} />
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
              <span className="font-medium">Description:</span> {prod.description}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Added: {new Date(prod.created_at).toLocaleDateString()}
            </p>

            {/* Mobile expand cottons */}
            {prod.cottons?.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => toggleExpand(prod.id)}
                  className="text-gray-600 text-sm flex items-center gap-1 font-medium hover:text-gray-800 transition-colors"
                >
                  {expanded[prod.id] ? (
                    <>
                      Hide Details <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      View Details <ChevronDown size={14} />
                    </>
                  )}
                </button>
                {expanded[prod.id] && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {prod.cottons.map((c) => (
                      <div key={c.id} className="flex flex-col border border-gray-200 px-3 py-2 rounded-lg bg-gray-100 shadow-sm min-w-[120px]">
                        <span className="font-semibold text-gray-800">{c.packing_unit}</span>
                        <span className="text-gray-600">Rs {c.price}</span>
                        <span className="text-gray-600">{c.stock} pcs</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <AddProductModal onClose={closeModal} product={editingProduct} />
      )}
    </>
  );
};

export default ProductsTable;