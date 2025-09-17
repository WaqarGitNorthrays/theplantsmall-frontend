// src/store/slices/dispatcherStatsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance";

// ---------------- FETCH DISPATCHER STATS ----------------
export const fetchDispatcherStats = createAsyncThunk(
  "dispatcher/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/dispatcher/api/dispatcher_dashboard_stats/");
      return res.data; // { dispatcher_id, dispatcher_analytics: {total_orders, orders_today, preparing, ready} }
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch stats");
    }
  }
);

const dispatcherStatsSlice = createSlice({
  name: "dispatcherStats",
  initialState: {
    dispatcherId: null,
    analytics: {
      total_orders: 0,
      orders_today: 0,
      preparing: 0,
      ready: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDispatcherStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDispatcherStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dispatcherId = action.payload.dispatcher_id;
        state.analytics = action.payload.dispatcher_analytics;
      })
      .addCase(fetchDispatcherStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dispatcherStatsSlice.reducer;
