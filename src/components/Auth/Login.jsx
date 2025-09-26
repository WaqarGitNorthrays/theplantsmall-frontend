import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Leaf, User, Package, Settings, Check, ArrowRight } from "lucide-react";
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";
import { useTranslation } from "react-i18next";

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [enableGPS, setEnableGPS] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);


  // Role cards
  const roles = [
    {
      id: "salesman",
      title: "Salesman",
      description: "Manage client relationships and sales.",
      icon: User,
      color: "hsl(142.1, 76.2%, 36.3%)", // green
      features: ["Shop Registration", "Order Taking", "GPS Navigation"],
    },
    {
      id: "dispatcher",
      title: "Dispatcher",
      description: "Coordinate orders and manage deliveries.",
      icon: Package,
      color: "hsl(142.1, 76.2%, 36.3%)", // amber
      features: ["Order Management", "Status Updates", "Real-time Tracking"],
    },
    {
      id: "admin",
      title: "Admin",
      description: "Oversee and optimize business operations.",
      icon: Settings,
      color: "hsl(142.1, 76.2%, 36.3%)", // gray
      features: ["Analytics Dashboard", "System Overview", "Performance Metrics"],
    },
    {
      id: "delivery_rider",
      title: "Delivery Rider",
      description: "Handle order deliveries efficiently.",
      icon: Package,
      color: "hsl(142.1, 76.2%, 36.3%)", // blue
      features: ["Route Optimization", "Delivery Status", "Customer Communication"],
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setEnableGPS(roleId === "salesman");

    const userRole = user?.role;
    const isSalesman =
      roleId === "salesman" &&
      (userRole === "salesman" || userRole === "sales_man");

    if (isAuthenticated && (userRole === roleId || isSalesman)) {
      if (roleId === "salesman") navigate("/salesman-dashboard");
      else if (roleId === "dispatcher") navigate("/dispatcher-dashboard");
      else if (roleId === "admin") navigate("/admin-dashboard");
      else if (roleId === "delivery_rider") navigate("/delivery-dashboard");
      return;
    }

    navigate(`/login/${roleId}`);
  };

  useRealTimeUpdates(enableGPS ? "salesman1" : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-green-600 to-green-400 rounded-2xl shadow-lg">
              <Leaf className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Welcome to <span className="text-green-600">The Plants Mall</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed px-4">
            Your all-in-one platform for managing shop registrations, orders,
            and logistics.
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <div
                key={role.id}
                className={`
                  relative overflow-hidden rounded-xl p-6 cursor-pointer
                  transition-all duration-300 ease-out
                  bg-white border-2 border-gray-200
                  hover:scale-[1.02] hover:shadow-lg hover:border-green-600/30
                  ${isSelected ? "ring-2 ring-green-600 shadow-md scale-[1.02] border-green-600/50 bg-gradient-to-br from-white to-green-50" : ""}
                `}
                onClick={() => handleRoleSelect(role.id)}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div
                    className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-green-600"
                  >
                    <Check className="absolute -top-8 -right-7 h-4 w-4 text-white" />
                  </div>
                )}

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center mb-4">
                    <div
                      className="p-2.5 rounded-lg mr-3"
                      style={{ backgroundColor: `${role.color}20` }} // transparent bg
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: role.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                        {role.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs sm:text-sm">
                        <div
                          className="w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="text-gray-500">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    className={`
                      w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg
                      font-medium text-sm transition-all duration-200
                      ${isSelected
                        ? "text-white shadow-lg"
                        : "hover:opacity-90"}
                    `}
                    style={{
                      backgroundColor: isSelected ? role.color : `${role.color}20`,
                      color: isSelected ? "#fff" : role.color,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect(role.id);
                    }}
                  >
                    <span>Select {role.title}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-xs text-gray-500">Secure • Fast • Reliable</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
