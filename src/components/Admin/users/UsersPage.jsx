import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../../store/slices/usersSlice";
import UsersTable from "./UsersTable";
// import User from "./UserFormPage ";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UsersPage = () => {
  const dispatch = useDispatch();
  const { users, loading, error, next, previous } = useSelector((state) => state.users);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

    const handleNextPage = () => {
    if (next) {
      dispatch(fetchUsers(next));
    }
  };

  const handlePreviousPage = () => {
    if (previous) {
      dispatch(fetchUsers(previous));
    }
  };

  return (
    <div className="min-h-screen" >
      <div className="bg-white p-3 md:p-6 sm:p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">
            All Users
          </h1>
          <button
          onClick={() => navigate("../users/new")}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-md"
        
          > 
            <Plus className="w-4 h-4" />
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
                 nextPageUrl={next}
        prevPageUrl={previous}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default UsersPage;