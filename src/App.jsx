// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import store from "./store/store";

import Login from "./components/Auth/Login";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import VerifyEmailForm from "./components/Auth/VerifyEmailForm";
import RiderDashboard from "./components/Rider/RiderDashboard";
import DispatcherDashboard from "./components/Dispatcher/DispatcherDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import OrderHistory from "./components/Rider/Order/OrderHistory";
import { useRealTimeUpdates } from "./hooks/useRealTimeUpdates";

// ✅ Generic private route (for salesman/dispatcher)
const PrivateRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  return children;
};

// ✅ Dedicated admin route
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  if (!isAuthenticated || user?.role !== "admin" || !adminAccessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  useRealTimeUpdates();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login/:role" element={<LoginForm />} />
      <Route path="/register/:role" element={<RegisterForm />} />
      <Route path="/verify-email" element={<VerifyEmailForm />} />

      {/* Private Routes */}
      <Route
        path="/salesman-dashboard"
        element={
          <PrivateRoute allowedRole="salesman">
            <RiderDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/dispatcher-dashboard"
        element={
          <PrivateRoute allowedRole="dispatcher">
            <DispatcherDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Salesman Order History */}
      <Route
        path="/order-history/:shopId"
        element={
          <PrivateRoute allowedRole="salesman">
            <OrderHistory />
          </PrivateRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
