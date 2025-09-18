// src/utils/axiosInstance.js
import axios from "axios";
import store from "../store/store";
import { logout } from "../store/slices/authSlice";

const api = axios.create({
  baseURL: "https://cc816f6f81ad.ngrok-free.app/",
  headers: {
    // "Content-Type": "application/json",
  },
  timeout: 10000, // 10s timeout
});

// 🔄 Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ✅ Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: handle 401 + refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue failed requests until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // 🔑 Call refresh endpoint
        const { data } = await axios.post("http://192.168.2.7/auth/api/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = data.access;

        // Save new access token
        localStorage.setItem("accessToken", newAccessToken);

        // Update queued requests
        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // 🚪 If refresh fails → clear storage and logout via Redux
        localStorage.removeItem("auth");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Dispatch logout (will update state, trigger PrivateRoute redirect if needed)
        store.dispatch(logout());

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    console.error("API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
