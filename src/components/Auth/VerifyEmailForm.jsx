import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/axiosInstance";
import AlertMessage from "../common/AlertMessage.jsx";

const VerifyEmailForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Grab email from state if passed from register page
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !code) {
      setAlert({ message: "Email and code are required.", type: "error", visible: true });
      return;
    }

    setLoading(true);
    try {
      const payload = { email, code: Number(code) };
      const res = await api.post("/auth/api/verify-email/", payload);
      
      setAlert({ message: "Email verified successfully!", type: "success", visible: true });

      // Redirect to login page after success
      setTimeout(() => {
        navigate("/login/salesman"); // or role dynamically
      }, 1500);
    } catch (err) {
      console.error(err);
      setAlert({ message: err.response?.data?.message || "Verification failed.", type: "error", visible: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Verify Your Email
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Enter the verification code sent to your email
        </p>

        {alert.visible && (
          <AlertMessage
            message={alert.message}
            type={alert.type}
            visible={alert.visible}
            onClose={() => setAlert({ ...alert, visible: false })}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="number"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailForm;
