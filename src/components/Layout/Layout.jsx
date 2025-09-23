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

  const salesmanId = user?.id;

  // ✅ Run location tracking only if role is salesman
  if (user?.role === "sales_man") {
    useRealTimeUpdates(salesmanId); 
    useSendLocation(salesmanId);
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="bg-white shadow-sm border-b border-green-100 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-1 sm:p-2 rounded-lg">
                    <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-semibold text-gray-900">The Plants Mall</h1>
                    {title && <p className="text-xs sm:text-sm text-gray-500">{title}</p>}
                  </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.username}
                </p>
                <p className={`text-xs capitalize ${getRoleColor(user?.role)}`}>
                  {user?.role === "sales_man" ? "Salesman" : user?.role === "delivery_rider" ? "Delivery Rider" : user?.role}
                  
                </p>
              </div>

                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors self-start sm:self-auto sm:p-2"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
