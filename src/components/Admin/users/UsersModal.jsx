import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { addUser, updateUser } from "../../../store/slices/usersSlice";

const ROLE_OPTIONS = [
  { value: "sales_man", label: "Sales Man" },
  { value: "dispatcher", label: "Dispatcher" },
  { value: "admin", label: "Admin" },
  { value: "delivery_rider", label: "Delivery Rider" },
];

const UsersModal = ({ user, onClose }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(user);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    phone: "",
    role: "sales_man",
    profile_pic: null, // New state for file object
  });

  const [imagePreview, setImagePreview] = useState(null); // New state for image preview URL
  const [loading, setLoading] = useState(false);

  // Prefill if editing
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        password: "", // Password should not be pre-filled for security
        email: user.email || "",
        name: user.name || "",
        phone: user.phone || "",
        role: user.role || "sales_man",
        profile_pic: null, // File input is always reset
      });
      // Set image preview from the existing user data
      if (user.profile_pic) {
        setImagePreview(user.profile_pic);
      } else {
        setImagePreview(null);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_pic" && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, profile_pic: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    const requiredFields = ["username", "email", "name", "phone"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill the ${field} field.`);
        return;
      }
    }

    setLoading(true);
    const userFormData = new FormData();
    userFormData.append("username", formData.username);
    userFormData.append("email", formData.email);
    userFormData.append("name", formData.name);
    userFormData.append("phone", formData.phone);
    userFormData.append("role", formData.role);
    
    // Append password if it exists
    if (formData.password) {
        userFormData.append("password", formData.password);
    }
    
    // Append profile picture if it exists
    if (formData.profile_pic) {
      userFormData.append("profile_pic", formData.profile_pic);
    }

    try {
      if (isEdit) {
        await dispatch(updateUser({ id: user.id, updates: userFormData })).unwrap();
        toast.success("User updated successfully!");
      } else {
        if (!formData.password) {
          toast.error("Password is required for new users.");
          setLoading(false);
          return;
        }
        await dispatch(addUser(userFormData)).unwrap();
        toast.success("User added successfully!");
      }
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative transform transition-all duration-300 scale-100 opacity-100 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-emerald-600 border-b pb-3 border-gray-100">
          {isEdit ? "Edit User" : "Add New User"}
        </h2>
        
        {/* Profile Picture Upload & Preview */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile Preview"
              className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-2xl">
              {formData.username ? formData.username.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <div>
            <label htmlFor="profile_pic" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture
            </label>
            <input
              type="file"
              name="profile_pic"
              id="profile_pic"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all duration-200 cursor-pointer"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Fields */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 1.79-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.21-3.582-4-8-4z" fill="currentColor" />
                </svg>
              </span>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 appearance-none"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {isEdit ? "New Password (Optional)" : "Password"}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-[1.01] shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {isEdit ? "Updating..." : "Saving..."}
              </>
            ) : (
              isEdit ? "Update User" : "Save User"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsersModal;