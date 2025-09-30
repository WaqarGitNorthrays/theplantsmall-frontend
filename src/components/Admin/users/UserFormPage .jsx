// src/pages/users/UserFormPage.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { addUser, updateUser, fetchUserById } from "../../../store/slices/usersSlice";

const ROLE_OPTIONS = [
  { value: "sales_man", label: "Sales Man" },
  { value: "dispatcher", label: "Dispatcher" },
  { value: "admin", label: "Admin" },
  { value: "delivery_rider", label: "Delivery Rider" },
];

const UserFormPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  
  const { selectedUser, loading } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    phone: "",
    role: "sales_man",
    profile_pic: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);

      // Fetch user detail when editing
  useEffect(() => {
    if (isEdit) {
      dispatch(fetchUserById(id));
    }
  }, [id, isEdit, dispatch]);

  // Prefill for edit
  useEffect(() => {
    if (selectedUser && isEdit) {
      setFormData({
        username: selectedUser.username || "",
        password: "",
        email: selectedUser.email || "",
        name: selectedUser.name || "",
        phone: selectedUser.phone || "",
        role: selectedUser.role || "sales_man",
        profile_pic: null,
      });
      setImagePreview(selectedUser.profile_pic || null);
    }
  }, [selectedUser, isEdit]);

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

    const requiredFields = ["username", "email", "name", "phone"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill the ${field} field.`);
        return;
      }
    }

    setSaving(true);
    const userFormData = new FormData();
    userFormData.append("username", formData.username);
    userFormData.append("email", formData.email);
    userFormData.append("name", formData.name);
    userFormData.append("phone", formData.phone);
    userFormData.append("role", formData.role);

    if (formData.password) {
      userFormData.append("password", formData.password);
    }
    if (formData.profile_pic) {
      userFormData.append("profile_pic", formData.profile_pic);
    }

    try {
      if (isEdit) {
        await dispatch(updateUser({ id, updates: userFormData })).unwrap();
        toast.success("User updated successfully!");
      } else {
        if (!formData.password) {
          toast.error("Password is required for new users.");
          setSaving(false);
          return;
        }
        await dispatch(addUser(userFormData)).unwrap();
        toast.success("User added successfully!");
      }
      navigate("../users");
    } catch (err) {
      toast.error(err?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEdit && !selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-xl p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors group mb-4"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Users
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isEdit ? "Edit User" : "Add New User"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isEdit ? "Update user details and profile" : "Fill in details to create a new user"}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-base font-semibold text-gray-900">Profile Picture</h2>
            <p className="text-xs text-gray-500 mt-0.5">Upload a user profile photo</p>
          </div>
          <div className="p-5 flex flex-col items-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl font-bold">
                {formData.username ? formData.username.charAt(0).toUpperCase() : "?"}
              </div>
            )}

            <label className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
              <Upload className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-green-600 transition-colors">
                Upload New Profile
              </span>
              <input
                type="file"
                name="profile_pic"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-sky-50">
              <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 
                             focus:border-green-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 
                             focus:border-green-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 
                             focus:border-green-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 
                             focus:border-green-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 
                             focus:border-green-500 focus:bg-white transition-all"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEdit ? "New Password (Optional)" : "Password"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    isEdit ? "Leave blank to keep current password" : "Enter password"
                  }
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 
                             focus:border-green-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 
                       rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 
                       disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 transition-all
                       hover:shadow-lg hover:shadow-green-500/20"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {isEdit ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>{isEdit ? "Update User" : "Save User"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormPage;
