import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../../store/slices/usersSlice";
import UsersTable from "./UsersTable";
import UsersModal from "./UsersModal";

const UsersPage = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="min-h-screen" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">
            User Management
          </h1>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 transition-all duration-300 transform hover:-translate-y-1"
          >
            Add User
          </button>
        </div>

        {loading && (
          <p className="text-center text-gray-500 text-lg py-12">
            Loading users...
          </p>
        )}
        {error && (
          <p className="text-red-500 text-center text-lg font-medium py-12">
            Error: {error}
          </p>
        )}

        {!loading && !error && (
          <div className="w-full">
            <div className="overflow-x-auto custom-scrollbar w-full">
              <UsersTable
                users={users}
                onEdit={(user) => {
                  setSelectedUser(user);
                  setIsModalOpen(true);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <UsersModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UsersPage;