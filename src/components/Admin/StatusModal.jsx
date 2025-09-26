import { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function StatusModal({ order, newStatus, newPaymentStatus, onClose, onConfirm }) {
  const [dispatchers, setDispatchers] = useState([]);
  const [riders, setRiders] = useState([]);
  const [selectedDispatcher, setSelectedDispatcher] = useState("");
  const [selectedRider, setSelectedRider] = useState("");

  useEffect(() => {
    if (newStatus === "confirmed") {
      const fetchDispatchers = async () => {
        try {
          const res = await api.get("/admin_operations/api/dispatchers/");
          setDispatchers(res.data || []);
        } catch (err) {
          console.error("Failed to fetch dispatchers", err);
          toast.error("Failed to load dispatchers");
        }
      };
      fetchDispatchers();
    } else if (newStatus === "ready") {
      const fetchRiders = async () => {
        try {
          const res = await api.get("/dispatcher/api/delivery_rider/");
          setRiders(res.data || []);
        } catch (err) {
          console.error("Failed to fetch riders", err);
          toast.error("Failed to load riders");
        }
      };
      fetchRiders();
    }
  }, [newStatus]);

  const handleConfirm = () => {
    if (newStatus === "confirmed" && !selectedDispatcher) {
      toast.error("Please select a dispatcher before confirming.");
      return;
    }
    if (newStatus === "ready" && !selectedRider) {
      toast.error("Please select a rider before confirming.");
      return;
    }

    const updates = {
      ...(newStatus && { status: newStatus }),
      ...(newPaymentStatus && { payment_status: newPaymentStatus }),
      ...(newStatus === "confirmed" ? { dispatcher: selectedDispatcher } : {}),
      ...(newStatus === "ready" ? { delivery_rider: selectedRider } : {}),
    };
    onConfirm(updates);
  };

  const isConfirmationNeeded = newStatus
    ? ["cancelled", "delivered", "preparing", "ready", "pending", "confirmed"].includes(newStatus)
    : ["unpaid", "paid", "refunded"].includes(newPaymentStatus);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">
          {newStatus === "confirmed"
            ? "Assign Dispatcher"
            : newStatus === "ready"
            ? "Assign Rider"
            : newPaymentStatus
            ? `Confirm Payment Status: ${newPaymentStatus}?`
            : isConfirmationNeeded
            ? `Confirm ${newStatus}?`
            : "Confirm Status Change"}
        </h2>

        {/* Dispatcher selection for confirmed status */}
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

        {/* Rider selection for ready status */}
        {newStatus === "ready" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Rider
            </label>
            <select
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Rider</option>
              {(riders?.results || []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phone})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Confirmation message for other statuses or payment status */}
        {isConfirmationNeeded && newStatus !== "confirmed" && newStatus !== "ready" && (
          <p className="text-gray-600 mb-4">
            Are you sure you want to mark this order as{" "}
            <span className="font-semibold">
              {newStatus ? newStatus : newPaymentStatus}
            </span>?
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
            {newStatus === "confirmed"
              ? "Assign & Update"
              : newStatus === "ready"
              ? "Assign Rider & Update"
              : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}