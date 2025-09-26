import React, { useState } from "react";
import { Dialog } from "@headlessui/react"; // lightweight modal lib

const VariantsSection = ({ variants, setVariants }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const openModal = (index) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setActiveIndex(null);
  };

  const updateVariant = (section, field, value) => {
    const updated = [...variants];
    updated[activeIndex][section][field] = value;
    setVariants(updated);
  };

  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold mb-3">Variants</h3>

      {/* Variant List */}
      <div className="space-y-3">
        {variants.map((variant, i) => (
          <div
            key={i}
            className="flex justify-between items-center border rounded-lg p-3 shadow-sm cursor-pointer hover:bg-gray-50"
            onClick={() => openModal(i)}
          >
            <span className="font-medium text-gray-700">{variant.packing_unit}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setVariants(variants.filter((_, idx) => idx !== i));
              }}
              className="text-red-500 text-sm hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            {activeIndex !== null && (
              <>
                <Dialog.Title className="text-lg font-semibold mb-4">
                  Edit Variant — {variants[activeIndex].packing_unit}
                </Dialog.Title>

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
                      <label className="block text-sm text-gray-600">Discount Price</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].loose.discount_price}
                        onChange={(e) =>
                          updateVariant("loose", "discount_price", e.target.value)
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
                      <label className="block text-sm text-gray-600">Pieces per Carton</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].carton.pieces_per_carton}
                        onChange={(e) =>
                          updateVariant("carton", "pieces_per_carton", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">No of Cartons</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].carton.no_of_cartons}
                        onChange={(e) =>
                          updateVariant("carton", "no_of_cartons", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Carton Price</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].carton.price}
                        onChange={(e) =>
                          updateVariant("carton", "price", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Carton Discount Price</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        value={variants[activeIndex].carton.discount_price}
                        onChange={(e) =>
                          updateVariant("carton", "discount_price", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded-lg"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
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

export default VariantsSection;
