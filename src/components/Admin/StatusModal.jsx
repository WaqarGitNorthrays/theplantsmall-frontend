import { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";

export default function StatusModal({ order, newStatus, onClose, onConfirm }) {
  const [dispatchers, setDispatchers] = useState([]);
  const [selectedDispatcher, setSelectedDispatcher] = useState("");

  useEffect(() => {
    if (newStatus === "confirmed") {
      const fetchDispatchers = async () => {
        try {
          const res = await api.get("/admin_operations/api/dispatchers/");
          setDispatchers(res.data || []);
        } catch (err) {
          console.error("Failed to fetch dispatchers", err);
        }
      };
      fetchDispatchers();
    }
  }, [newStatus]);

  const handleConfirm = () => {
    if (newStatus === "confirmed" && !selectedDispatcher) {
      alert("Please select a dispatcher before confirming.");
      return;
    }
    onConfirm({
      status: newStatus,
      ...(newStatus === "confirmed" ? { dispatcher: selectedDispatcher } : {}),
    });
  };

  const isConfirmationNeeded = [
    "cancelled",
    "delivered",
    "preparing",
    "ready for pickup",
    "pending",
  ].includes(newStatus);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">
          {newStatus === "confirmed"
            ? "Assign Dispatcher"
            : isConfirmationNeeded
            ? `Confirm ${newStatus}?`
            : "Confirm Status Change"}
        </h2>

        {/* Dispatcher selection only if status = confirmed */}
        {newStatus === "confirmed" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Dispatcher
            </label>
            <select
              value={selectedDispatcher}
              onChange={(e) => setSelectedDispatcher(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Dispatcher</option>
              {(dispatchers?.results || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Confirmation message for other statuses */}
        {isConfirmationNeeded && (
          <p className="text-gray-600 mb-4">
            Are you sure you want to mark this order as{" "}
            <span className="font-semibold">{newStatus}</span>?
          </p>
        )}

        {/* Footer buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            {newStatus === "confirmed" ? "Assign & Update" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
