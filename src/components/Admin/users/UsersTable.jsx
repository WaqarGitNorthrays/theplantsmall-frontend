// src/components/UsersTable.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  MoreVertical,
  User,
  Mail,
  Phone,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ConfirmDialog from "../../common/ConfirmDialog";


// The Pagination component is now part of this file for simplicity,
// but it's good practice to move it to its own file later.
const Pagination = ({
  nextPageUrl,
  prevPageUrl,
  onNext,
  onPrevious,
}) => (
  <div className="flex items-center justify-between p-4 mt-6">
    <button
      onClick={onPrevious}
      disabled={!prevPageUrl}
      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronLeft size={16} className="mr-2" /> Previous
    </button>
    <button
      onClick={onNext}
      disabled={!nextPageUrl}
      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Next <ChevronRight size={16} className="ml-2" />
    </button>
  </div>
);

const roleLabels = {
  sales_man: "Salesman",
  admin: "Admin",
  dispatcher: "Dispatcher",
  delivery_rider: "Delivery Rider",
};

  const UsersTable = ({
    users,
    onEdit,
    onDeleteConfirm,
    nextPageUrl,
    prevPageUrl,
    onNextPage,
    onPreviousPage,
  }) => {

  const usersArray = Array.isArray(users) ? users : [];
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const handleDropdownToggle = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

    const handleActionClick = (user) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (selectedUser) {
      // onDeleteConfirm({ ...selectedUser, is_active: !selectedUser.is_active });
          onDeleteConfirm(selectedUser);
    }
    setConfirmOpen(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (openDropdownId && !event.target.closest(".dropdown-container")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openDropdownId]);

  if (usersArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm text-gray-500">
        <User size={48} className="mb-4 text-gray-300" />
        <p className="text-lg font-medium">No users found.</p>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "dispatcher":
        return "bg-sky-100 text-sky-800";
      case "delivery_rider":
        return "bg-orange-100 text-orange-800";
      case "sales_man":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserStatusColor = (is_active) =>
    is_active ? "bg-emerald-500" : "bg-red-500";
  const getUserStatusText = (is_active) =>
    is_active ? "Active" : "Inactive";
  const getUserStatusTextColor = (is_active) =>
    is_active ? "text-emerald-600" : "text-red-600";

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block w-full overflow-x-auto rounded-lg shadow-sm">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600 rounded-tl-lg">
                Profile
              </th>
              <th className="px-6 py-4 font-semibold text-gray-600">Username</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Phone</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Role</th>
              <th className="px-6 py-4 font-semibold text-gray-600">
                Last Activity
              </th>
              <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600 rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usersArray.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  {user.profile_pic ? (
                    <img
                      src={user.profile_pic}
                      alt={user.username}
                      className="w-10 h-10 object-cover rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                      {(user.username && user.username.charAt(0).toUpperCase()) ||
                        "?"}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">
                  {user.username}
                </td>
                <td className="px-6 py-4 text-gray-700">{user.name}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-gray-600">{user.phone || "-"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {user.last_activity
                    ? new Date(user.last_activity).toLocaleString()
                    : "-"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getUserStatusColor(
                        user.is_active
                      )}`}
                    ></span>
                    <span
                      className={`text-sm font-medium ${getUserStatusTextColor(
                        user.is_active
                      )}`}
                    >
                      {getUserStatusText(user.is_active)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`relative dropdown-container ${
                      openDropdownId === user.id ? "z-20" : ""
                    }`}
                  >
                    <button
                      className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDropdownToggle(user.id);
                      }}
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openDropdownId === user.id && (
                      <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`../users/edit/${user.id}`)
                              setOpenDropdownId(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
                            role="menuitem"
                          >
                            <Edit size={16} className="mr-2 text-emerald-500" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const action = user.is_active ? "deactivate" : "activate";
                              handleActionClick(user);

                              setOpenDropdownId(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
                            role="menuitem"
                          >
                            <Trash2
                              size={16}
                              className={`mr-2 ${user.is_active ? "text-red-500" : "text-emerald-500"}`}
                            />
                            {user.is_active ? "Inactive" : "Active"}
                          </button>

                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {usersArray.map((user) => (
          <div
            key={user.id}
            className="border border-gray-200 rounded-xl shadow-sm p-5 bg-white transition-all duration-300 transform hover:shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {user.profile_pic ? (
                    <img
                      src={user.profile_pic}
                      alt={user.username}
                      className="w-14 h-14 object-cover rounded-full border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl border-2 border-white shadow-md">
                      {(user.username && user.username.charAt(0).toUpperCase()) ||
                        "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-lg truncate">
                    {user.name}
                  </h4>
                  <p className="text-sm text-gray-600 truncate mt-0.5">
                      @{user.username}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {roleLabels[user.role]}
                </span>
                <div className="flex items-center justify-end mt-2 gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${getUserStatusColor(
                      user.is_active
                    )}`}
                  ></span>
                  <span
                    className={`text-sm font-medium ${getUserStatusTextColor(
                      user.is_active
                    )}`}
                  >
                    {getUserStatusText(user.is_active)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-700 truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700 truncate">{user.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-700 truncate">
                  {user.last_activity
                    ? new Date(user.last_activity).toLocaleDateString()
                    : "No recent activity"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-3 rounded-md font-medium hover:bg-emerald-100 transition-colors"
                onClick={() =>   navigate(`../users/edit/${user.id}`)}
              >
                <Edit size={16} /> Edit
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-colors ${
                  user.is_active
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
                onClick={() => {
                    handleActionClick(user);
                }}
              >
                {user.is_active ? "Inactive" : "Activate"}
              </button>

            </div>
          </div>
        ))}
      </div>
      {/* Add the new Pagination component at the bottom of the table. */}
      <Pagination
        nextPageUrl={nextPageUrl}
        prevPageUrl={prevPageUrl}
        onNext={onNextPage}
        onPrevious={onPreviousPage}
      />
      <ConfirmDialog
  open={confirmOpen}
  title="Confirm Action"
  message={`Are you sure you want to ${selectedUser?.is_active ? "deactivate" : "activate"} this user?`}
  onConfirm={handleConfirm}
  onCancel={() => setConfirmOpen(false)}
/>
    </>
  );
};

export default UsersTable;