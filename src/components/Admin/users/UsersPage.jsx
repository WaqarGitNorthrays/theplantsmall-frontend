import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../../store/slices/usersSlice";
import UsersTable from "./UsersTable";
import UsersModal from "./UsersModal";

const UsersPage = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Add User
        </button>
      </div>

      {loading && <p>Loading...</p>}
      <UsersTable users={users} error={error} />

      {showModal && <UsersModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default UsersPage;
