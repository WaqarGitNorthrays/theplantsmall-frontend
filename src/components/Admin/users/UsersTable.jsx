import React from "react";

const roleLabels = {
  sales_man: "Salesman",
  admin: "Admin",
  dispatcher: "Dispatcher",
  delivery_rider: "Delivery Rider",
};

const UsersTable = ({ users }) => {
    const usersArray = Array.isArray(users) ? users : [];

    if (usersArray.length === 0) {
        return <p className="text-gray-500 text-center py-4">No users found.</p>;
    }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 text-sm text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 border">Profile</th>
            <th className="px-4 py-2 border">Username</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Phone</th>
            <th className="px-4 py-2 border">Role</th>
            <th className="px-4 py-2 border">Last Activity</th>
            <th className="px-4 py-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {usersArray.map ((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                {user.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt={user.username}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                )}
              </td>
              <td className="px-4 py-2 border">{user.username}</td>
              <td className="px-4 py-2 border">{user.name}</td>
              <td className="px-4 py-2 border">{user.email}</td>
              <td className="px-4 py-2 border">{user.phone || "-"}</td>
              <td className="px-4 py-2 border">{roleLabels[user.role]}</td>
              <td className="px-4 py-2 border">
                {user.last_activity
                  ? new Date(user.last_activity).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-2 border">
                {user.is_active ? "Active" : "Inactive"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
