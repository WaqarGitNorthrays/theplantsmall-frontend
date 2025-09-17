import React, { useState, useEffect } from "react";
import { Edit, Trash2, MoreVertical } from "lucide-react";

const roleLabels = {
  sales_man: "Salesman",
  admin: "Admin",
  dispatcher: "Dispatcher",
  delivery_rider: "Delivery Rider",
};

const UsersTable = ({ users, onEdit, onDeleteConfirm }) => {
  const usersArray = Array.isArray(users) ? users : [];
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleDropdownToggle = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const openDropdown = document.querySelector(".dropdown-open");
      if (openDropdown && !event.target.closest(".dropdown-open")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  if (usersArray.length === 0) {
    return <p className="text-gray-500 text-center py-4">No users found.</p>;
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

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block w-full overflow-x-auto custom-scrollbar">
        <table className="min-w-max rounded-lg text-sm text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-500 rounded-tl-lg">Profile</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Username</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Name</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Email</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Phone</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Role</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Last Activity</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-500 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {usersArray.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  {user.profile_pic ? (
                    <img
                      src={user.profile_pic}
                      alt={user.username}
                      className="w-10 h-10 object-cover rounded-full shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                      {(user.username && user.username.charAt(0).toUpperCase()) || "?"}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-gray-700">{user.username}</td>
                <td className="px-6 py-4 text-gray-600">{user.name}</td>
                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                <td className="px-6 py-4 text-gray-500">{user.phone || "-"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getRoleBadgeColor(user.role)}`}>
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {user.last_activity ? new Date(user.last_activity).toLocaleString() : "-"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-red-500"}`}></span>
                    <span className={`text-sm ${user.is_active ? "text-emerald-600" : "text-red-600"}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`relative ${openDropdownId === user.id ? "dropdown-open" : ""}`}>
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
                              onEdit(user);
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
                              onDeleteConfirm(user);
                              setOpenDropdownId(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
                            role="menuitem"
                          >
                            <Trash2 size={16} className="mr-2 text-red-500" />
                            Delete
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
          <div key={user.id} className="border border-gray-100 rounded-xl shadow-sm p-5 bg-white transition-all duration-300 transform hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt={user.username} className="w-12 h-12 object-cover rounded-full shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">
                      {(user.username && user.username.charAt(0).toUpperCase()) || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-lg truncate">{user.name}</h4>
                  <p className="text-sm text-gray-500 truncate mt-0.5">@{user.username}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getRoleBadgeColor(user.role)}`}>
                {roleLabels[user.role]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm border-t border-gray-100 pt-4">
              <div className="flex flex-col">
                <span className="text-gray-500">Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-red-500"}`}></span>
                  <span className={`font-semibold ${user.is_active ? "text-emerald-600" : "text-red-600"}`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Last Activity</span>
                <span className="font-medium text-gray-700 mt-1">{user.last_activity ? new Date(user.last_activity).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-700 mt-1">{user.email}</span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-700 mt-1">{user.phone || "-"}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
                onClick={() => onEdit(user)}
              >
                <Edit size={16} /> Edit
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-md font-medium hover:bg-red-100 transition-colors"
                onClick={() => onDeleteConfirm(user)}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UsersTable;
