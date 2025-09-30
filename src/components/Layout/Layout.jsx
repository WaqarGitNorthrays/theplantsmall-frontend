// src/components/Layout/Layout.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { LogOut, Leaf } from "lucide-react";
import { useSendLocation } from "../../hooks/useSendLocation"; 
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";

const Layout = ({ children, title }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useRealTimeUpdates(user?.role === "sales_man" ? user?.id : null); 
  useSendLocation(user?.role === "sales_man" ? user?.id : null);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "sales_man":
        return "text-emerald-600";
      case "dispatcher":
        return "text-lime-600";
      case "delivery_rider":
        return "text-green-600";
      case "admin":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case "sales_man":
        return "Salesman";
      case "delivery_rider":
        return "Delivery Rider";
      case "dispatcher":
        return "Dispatcher";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-40">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0 shadow-sm">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate">
                  The Plants Mall
                </h1>
                {title && (
                  <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">
                    {title}
                  </p>
                )}
              </div>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 truncate max-w-[100px] sm:max-w-[150px] lg:max-w-none">
                  {user?.name || user?.username}
                </p>
                <p className={`text-xs lg:text-sm font-medium ${getRoleColor(user?.role)}`}>
                  {getRoleDisplay(user?.role)}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200 group flex-shrink-0"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;