// src/components/Admin/AdminSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Grid, UserPlus, ShoppingBag, Layers, X, Store  } from "lucide-react";

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: <Grid className="h-5 w-5" /> },
    { key: "users", label: "Users", icon: <UserPlus className="h-5 w-5" /> },
    { key: "products", label: "Products", icon: <ShoppingBag className="h-5 w-5" /> },
    { key: "map", label: "Map", icon: <Layers className="h-5 w-5" /> },
    { key: "shops", label: "Shops", icon: <Store className="h-5 w-5" /> },
  ];
 
  return (
    <aside
      className={`bg-white shadow-sm border-r border-gray-100 rounded-xl
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:relative md:w-64
        fixed top-0 left-0 h-full w-64 z-30 transition-transform duration-300 ease-in-out`}
    >
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-600">Admin</h2>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-gray-600 hover:text-gray-900"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="p-4 space-y-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === `/admin-dashboard/${tab.key}`;
          return (
            <Link
              key={tab.key}
              to={`/admin-dashboard/${tab.key}`}
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
