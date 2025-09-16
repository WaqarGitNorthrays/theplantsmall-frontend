// src/components/Admin/users/UsersModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { addUser } from "../../../store/slices/usersSlice";

const ROLE_OPTIONS = [
  { value: "sales_man", label: "Sales Man" },
  { value: "dispatcher", label: "Dispatcher" },
  { value: "admin", label: "Admin" },
  { value: "delivery_rider", label: "Delivery Rider" },
];

const UsersModal = ({ onClose }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    phone: "",
    role: "sales_man",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const requiredFields = ["username", "password", "email", "name", "phone"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill ${field}`);
        return;
      }
    }

    setLoading(true);
    try {
      await dispatch(addUser(formData)).unwrap();
      toast.success("User added successfully!");
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-green-700">Add User</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            {loading ? "Saving..." : "Save User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsersModal;
