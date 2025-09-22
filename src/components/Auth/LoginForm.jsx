// src/components/Auth/LoginForm.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../store/slices/authSlice.js";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { error, loading } = useSelector((state) => state.auth);

  // Local form state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const dashboards = {
    salesman: "/salesman-dashboard",
    sales_man: "/salesman-dashboard",
    dispatcher: "/dispatcher-dashboard",
    admin: "/admin-dashboard",
    delivery: "/delivery-dashboard",
    delivery_rider: "/delivery-dashboard",
  };

  const roleDisplay = {
    salesman: "Salesman",
    dispatcher: "Dispatcher",
    admin: "Admin",
    delivery: "Delivery Rider",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setLocalError("Both email/username and password are required.");
      return;
    }
    setLocalError("");

    // Map 'salesman' to 'sales_man' for backend
    const backendRole = role === "salesman" ? "sales_man" : role;
    // console.log("Login payload:", { identifier, password, role: backendRole });

    try {
      await dispatch(login({ identifier, password, role: backendRole })).unwrap();
      dispatch(clearError());
  // Use backendRole for navigation, fallback to role
  navigate(dashboards[backendRole] || dashboards[role]); // Only navigate on success
    } catch {
      // ❌ Do not parse error again here
      // Redux error already contains the backend message
    }
  };

  const displayError = localError || error;

  React.useEffect(() => {
    // Clear error on mount/unmount
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize text-center">
          {roleDisplay[role]} Login
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Enter your credentials to access your {roleDisplay[role]} dashboard
        </p>

        {displayError && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email / Username
            </label>
            <input
              type="text"
              placeholder="Enter email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              dispatch(clearError());
              navigate("/");
            }}
            className="text-sm text-gray-500 hover:underline"
          >
            ← Back to role selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
 