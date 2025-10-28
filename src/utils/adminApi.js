// src/utils/adminApi.js
import axios from "axios";

const adminApi = axios.create({
  baseURL: process.env.PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
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

// ✅ Request interceptor → attach admin access token
adminApi.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("adminAccessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor → handle refresh token logic
adminApi.interceptors.response.use(
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
            return adminApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("adminRefreshToken");

        if (!refreshToken) {
          throw new Error("No admin refresh token available");
        }

        // 🔑 Refresh admin token
        const { data } = await axios.post(
          "https://the-plants-mall-backend.onrender.com/auth/api/refresh/",
          { refresh: refreshToken }
        );

        const newAccessToken = data.access;

        // Save new admin access token
        localStorage.setItem("adminAccessToken", newAccessToken);

        // Update queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return adminApi(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // 🚪 If refresh fails → clear admin tokens + redirect
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    console.error("Admin API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default adminApi;
