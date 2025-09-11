import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import AlertMessage from "../common/AlertMessage.jsx";

const RegisterForm = () => {
  const { role } = useParams(); // role from login selection
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

        const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.username || !formData.password || !formData.email || !formData.name || !formData.phone) {
            setAlert({ message: "All fields are required.", type: "error", visible: true });
            return;
        }

        setLoading(true);
        try {
            // Map frontend role to backend role values
            const roleMap = {
            salesman: "sales_man",
            dispatcher: "dispatcher",
            admin: "admin",
            };

            const payload = { ...formData, role: roleMap[role] }; // roleMap applied
            const res = await api.post("auth/api/register/", payload);

            setAlert({ message: "Registration successful! Please verify your email.", type: "success", visible: true });

            // Navigate to Verify Email screen and pass email
            navigate("/verify-email", { state: { email: formData.email } });
        } catch (err) {
            console.error(err);
            setAlert({ message: err.response?.data?.message || "Registration failed.", type: "error", visible: true });
        } finally {
            setLoading(false);
        }
        };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center capitalize">
          {role} Registration
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Create an account to access your {role} dashboard
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
