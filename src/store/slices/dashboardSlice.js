// src/store/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminApi from "../../utils/adminApi"; // ✅ use adminApi not normal api

// --- fetch dashboard stats ---
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get("/admin_operations/api/dashboard_stats/");
      console.log("✅ Dashboard stats fetched:", response.data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to load stats");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: null,   // whole payload
    loading: false,
    error: null,
  },
  reducers: {
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
