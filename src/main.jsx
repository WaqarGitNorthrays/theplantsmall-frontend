import { StrictMode } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Import PWA register helper
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    toast.info(
      <div className="flex items-center gap-3">
        <span>🔄 A new version is available.</span>
        <button
          onClick={() => {
            updateSW(true); // force refresh
            window.location.reload();
          }}
          className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Refresh
        </button>
      </div>,
      {
        position: "bottom-center",
        autoClose: false, // keep visible until user clicks
        closeOnClick: false,
        draggable: false,
        closeButton: true,
      }
    );
  },
  onOfflineReady() {
    toast.success("✅ App is ready to work offline!", {
      position: "bottom-center",
      autoClose: 3000,
    });
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastContainer position="top-right" autoClose={5000} />
    <Router>
      <App />
    </Router>
  </StrictMode>
);
