import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, User, Package, Settings } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");

  const roles = [
    {
      id: "salesman", // 🔑 updated from "rider" to "salesman"
      title: "Salesman",
      description: "Register shops and take orders",
      icon: User,
      color: "emerald",
      features: ["Shop Registration", "Order Taking", "GPS Navigation"],
    },
    {
      id: "dispatcher",
      title: "Dispatcher",
      description: "Manage and process orders",
      icon: Package,
      color: "lime",
      features: ["Order Management", "Status Updates", "Real-time Monitoring"],
    },
    {
      id: "admin",
      title: "Admin",
      description: "Monitor all operations",
      icon: Settings,
      color: "green",
      features: ["Analytics Dashboard", "System Overview", "Performance Metrics"],
    },
  ];

  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50 hover:bg-emerald-100",
      border: "border-emerald-200 hover:border-emerald-300",
      text: "text-emerald-600",
      icon: "text-emerald-500",
    },
    lime: {
      bg: "bg-lime-50 hover:bg-lime-100",
      border: "border-lime-200 hover:border-lime-300",
      text: "text-lime-600",
      icon: "text-lime-500",
    },
    green: {
      bg: "bg-green-50 hover:bg-green-100",
      border: "border-green-200 hover:border-green-300",
      text: "text-green-600",
      icon: "text-green-500",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <Leaf className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Plant Small
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your comprehensive platform for managing shop registrations, orders, and logistics
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const colors = colorClasses[role.color];

            return (
              <div
                key={role.id}
                className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-8 cursor-pointer 
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg 
                ${selectedRole === role.id ? "ring-4 ring-green-400" : ""}`}
                onClick={() => {
                  setSelectedRole(role.id);
                  navigate(`/login/${role.id}`); // 🔑 updated to use role.id
                }}
              >
                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-xl bg-white shadow-sm mb-6`}>
                    <Icon className={`h-8 w-8 ${colors.icon}`} />
                  </div>

                  <h3 className={`text-2xl font-bold ${colors.text} mb-3`}>
                    {role.title}
                  </h3>

                  <p className="text-gray-700 mb-6 text-lg">{role.description}</p>

                  <ul className="space-y-2 mb-8">
                    {role.features.map((feature, index) => (
                      <li key={index} className="text-gray-600 text-sm">
                        • {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full ${colors.bg} ${colors.text} font-semibold py-3 px-6 rounded-xl border-2 ${colors.border} hover:bg-white transition-colors`}
                  >
                    Continue as {role.title}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Choose your role to access the login form
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
