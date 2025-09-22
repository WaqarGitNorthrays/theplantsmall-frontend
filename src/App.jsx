// src/App.jsx
import React, { useEffect } from "react";
import {Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import store from "./store/store";
import { restoreSession } from "./store/slices/authSlice";

import Login from "./components/Auth/Login";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import VerifyEmailForm from "./components/Auth/VerifyEmailForm";
import RiderDashboard from "./components/Rider/RiderDashboard";
import DispatcherDashboard from "./components/Dispatcher/DispatcherDashboard";
import DeliveryDashboard from "./components/DeliveryRider/DeliveryRiderDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import OrderHistory from "./components/Rider/Order/OrderHistory";

// ✅ Generic private route (for salesman/dispatcher)
const PrivateRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // redirect to the dashboard that matches their role
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
  const dispatch = store.dispatch;
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <Routes>
      {/* -------- PUBLIC ROUTES -------- */}
      <Route path="/" element={<Login />} />
      <Route path="/login/:role" element={<LoginForm />} />
      <Route path="/register/:role" element={<RegisterForm />} />
      <Route path="/verify-email" element={<VerifyEmailForm />} />

      {/* -------- PROTECTED ROUTES -------- */}
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
        path="/delivery-dashboard"
        element={
          <PrivateRoute allowedRole="delivery_rider">
            <DeliveryDashboard />
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

      {/* -------- NESTED PROTECTED ROUTES -------- */}
      <Route
        path="/order-history/:shopId"
        element={
          <PrivateRoute allowedRole="salesman">
            <OrderHistory />
          </PrivateRoute>
        }
      />

      {/* -------- CATCH-ALL -------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
        <AppContent />
    </Provider>
  );
}

export default App;
