// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector, useDispatch } from "react-redux";
import store from "./store/store";
import { restoreSession } from "./store/slices/authSlice";
import Login from "./components/Auth/Login";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import VerifyEmailForm from "./components/Auth/VerifyEmailForm";
import RiderDashboard from "./components/Rider/SalesmanDashboard";
import DispatcherDashboard from "./components/Dispatcher/DispatcherDashboard";
import DeliveryDashboard from "./components/DeliveryRider/DeliveryRiderDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import OrderHistory from "./components/Rider/Order/OrderHistory";

// ✅ normalize roles for consistency
const normalizeRole = (role) => {
  if (!role) return null;
  if (role === "sales_man") return "salesman";
  return role;
};

const PrivateRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const userRole = normalizeRole(user?.role);
  const isSalesman =
    allowedRole === "salesman" &&
    (userRole === "salesman" || userRole === "sales_man");

  if (allowedRole && !isSalesman && userRole !== allowedRole) {
    return <Navigate to={`/${userRole}-dashboard`} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  if (!isAuthenticated || normalizeRole(user?.role) !== "admin" || !adminAccessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { initializing, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  const normalizedRole = normalizeRole(user?.role);

  return (
    <Routes>
      {/* -------- PUBLIC ROUTES -------- */}
      <Route
        path="/"
        element={
          isAuthenticated && normalizedRole ? (
            <Navigate to={`/${normalizedRole}-dashboard`} replace />
          ) : (
            <Login />
          )
        }
      />
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
      <Route
        path="/admin-dashboard/*"
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
