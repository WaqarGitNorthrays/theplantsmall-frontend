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
  error: null,
  loading: false,
};

// ✅ Async thunk for login
export const login = createAsyncThunk(
  "auth/login",
  async ({ identifier, password, role }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/api/login/", {
        identifier,
        password,
      });

      const { access, refresh, user } = response.data;

      // 🔑 Save tokens
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // 🔑 Save user + role
      const userData = { ...user, role };
      localStorage.setItem(
        "auth",
        JSON.stringify({ user: userData, isAuthenticated: true })
      );

      return { user: userData, access, refresh };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Login failed. Please try again."
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
      state.error = null;
      state.loading = false;

      localStorage.removeItem("auth");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    restoreSession: (state) => {
      const saved = localStorage.getItem("auth");
      if (saved) {
        const parsed = JSON.parse(saved);
        state.user = parsed.user || null;
        state.isAuthenticated = !!parsed.isAuthenticated;
        state.access = localStorage.getItem("accessToken") || null;
        state.refresh = localStorage.getItem("refreshToken") || null;
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
        state.isAuthenticated = true;
        state.error = null;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.access = null;
        state.refresh = null;
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;
