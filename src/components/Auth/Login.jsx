import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Leaf, User, Package, Settings, Check } from "lucide-react";
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates.js";

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [enableGPS, setEnableGPS] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Role cards with updated data and colors
  const roles = [
    {
      id: "salesman",
      title: "Salesman",
      description: "Manage client relationships and sales.",
      icon: User,
      color: "green",
      features: ["Shop Registration", "Order Taking", "GPS Navigation"],
    },
    {
      id: "dispatcher",
      title: "Dispatcher",
      description: "Coordinate orders and manage deliveries.",
      icon: Package,
      color: "amber",
      features: ["Order Management", "Status Updates", "Real-time Tracking"],
    },
    {
      id: "admin",
      title: "Admin",
      description: "Oversee and optimize business operations.",
      icon: Settings,
      color: "gray",
      features: ["Analytics Dashboard", "System Overview", "Performance Metrics"],
    },
    {
      id: "delivery_rider",
      title: "Delivery Rider",
      description: "Handle order deliveries efficiently.",
      icon: Package,
      color: "blue",
      features: ["Route Optimization", "Delivery Status", "Customer Communication"],
    }
  ];

  // Role selection logic remains unchanged
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setEnableGPS(roleId === "salesman");
    // If authenticated and role matches, redirect to dashboard
    const userRole = user?.role;
    const isSalesman = roleId === "salesman" && (userRole === "salesman" || userRole === "sales_man");
    if (isAuthenticated && (userRole === roleId || isSalesman)) {
      if (roleId === "salesman") navigate("/salesman-dashboard");
      else if (roleId === "dispatcher") navigate("/dispatcher-dashboard");
      else if (roleId === "admin") navigate("/admin-dashboard");
      else if (roleId === "delivery_rider") navigate("/delivery-dashboard");
      return;
    }
    // Otherwise, show login form for that role
    navigate(`/login/${roleId}`);
  };

  useRealTimeUpdates(enableGPS ? "salesman1" : null);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-8 sm:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Leaf className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Welcome to <span className="text-green-600">The Plants Mall</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Your all-in-one platform for managing shop registrations, orders, and logistics.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            const cardHoverClasses = `transform hover:scale-105 hover:shadow-2xl`;

            let cardClasses = `transition-all duration-300 rounded-xl p-8 border-2 cursor-pointer
              ${isSelected ? "border-green-600 ring-4 ring-green-200" : "border-gray-200"}
              ${cardHoverClasses}
              bg-white shadow-lg`;

            return (
              <div
                key={role.id}
                className={cardClasses}
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="flex items-center mb-6">
                  <Icon className={`h-10 w-10 text-green-700 mr-4`} />
                  <h3 className="text-2xl font-bold text-gray-800">
                    {role.title}
                  </h3>
                </div>

                <p className="text-gray-600 mb-6">{role.description}</p>

                <ul className="space-y-3 mb-8">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-500">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="w-full bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-colors duration-300
                    hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={() => handleRoleSelect(role.id)}
                >
                  {role.title}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Login;