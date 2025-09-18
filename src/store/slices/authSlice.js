// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance"; // centralized axios

// Restore saved auth state from localStorage
const savedAuth = JSON.parse(localStorage.getItem("auth"));

const initialState = {
  user: savedAuth?.user || null,
  isAuthenticated: savedAuth?.isAuthenticated || false,
  access: localStorage.getItem("accessToken") || null,
  refresh: localStorage.getItem("refreshToken") || null,
  adminAccess: localStorage.getItem("adminAccessToken") || null,
  adminRefresh: localStorage.getItem("adminRefreshToken") || null,
  error: null,
  loading: false,
};

//Async thunk for login

export const login = createAsyncThunk(
  "auth/login",
  async ({ identifier, password, role }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/api/login/", {
        identifier,
        password,
      });

      const { access, refresh, user } = response.data; 
      const userData = { ...user, role };

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      if (role === "admin") {
        localStorage.setItem("adminAccessToken", access);
        localStorage.setItem("adminRefreshToken", refresh);
      }

      localStorage.setItem(
        "auth",
        JSON.stringify({ user: userData, isAuthenticated: true })
      );

      return {
        user: userData,
        access,
        refresh,
        adminAccess: role === "admin" ? access : null,
        adminRefresh: role === "admin" ? refresh : null,
      };
    } catch(error) {
      return rejectWithValue(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Login failed"
      );
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.access = null;
      state.refresh = null;
      state.adminAccess = null;
      state.adminRefresh = null;
      state.error = null;
      state.loading = false;

      // clear all tokens
      localStorage.removeItem("auth");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
    },
    restoreSession: (state) => {
      const saved = localStorage.getItem("auth");
      if (saved) {
        const parsed = JSON.parse(saved);
        state.user = parsed.user || null;
        state.isAuthenticated = !!parsed.isAuthenticated;
        state.access = localStorage.getItem("accessToken") || null;
        state.refresh = localStorage.getItem("refreshToken") || null;
        state.adminAccess = localStorage.getItem("adminAccessToken") || null;
        state.adminRefresh = localStorage.getItem("adminRefreshToken") || null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.access = action.payload.access;
        state.refresh = action.payload.refresh;
        state.adminAccess = action.payload.adminAccess;
        state.adminRefresh = action.payload.adminRefresh;
        state.isAuthenticated = true;
        state.error = null;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.access = null;
        state.refresh = null;
        state.adminAccess = null;
        state.adminRefresh = null;
        state.error = action.payload; // ✅ API error message displayed
        state.loading = false;
      });
  },
});

export const { logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;
