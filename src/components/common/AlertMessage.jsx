import React from "react";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

const AlertMessage = ({ type = "info", message, onClose }) => {
  const alertTypes = {
    success: {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-200",
    },
    error: {
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-200",
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
    },
    info: {
      icon: <Info className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
    },
  };

  // fallback to "info" if type is not found
  const alertConfig = alertTypes[type] || alertTypes.info;

  return (
    <div
      className={`flex items-center justify-between w-full p-4 mb-4 text-sm rounded-lg border shadow-sm ${alertConfig.bg} ${alertConfig.text} ${alertConfig.border}`}
      role="alert"
    >
      <div className="flex items-center space-x-2">
        {alertConfig.icon}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
