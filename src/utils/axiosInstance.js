// src/utils/axiosInstance.js
import axios from "axios";
import { logout } from "../store/slices/authSlice";

let appStore;
export const injectStore = (_store) => {
  appStore = _store;
};


const api = axios.create({
  baseURL: "https://the-plants-mall-backend.onrender.com/",
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

    // 🚨 If this is login or refresh request, don't try refresh
    if (originalRequest.url.includes("/auth/api/login/") || originalRequest.url.includes("/auth/api/refresh/")) {
      return Promise.reject(error); // pass backend error directly
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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
          return Promise.reject(error); // ✅ send backend error instead of throwing
        }

        const { data } = await api.post("/auth/api/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = data.access;
        localStorage.setItem("accessToken", newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("auth");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        appStore?.dispatch(logout());
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export default api;
