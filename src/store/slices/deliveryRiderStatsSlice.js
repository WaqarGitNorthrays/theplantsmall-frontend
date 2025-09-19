// src/store/slices/deliveryRiderDashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance";
// Thunk to fetch rider stats
export const fetchDeliveryRiderStats = createAsyncThunk(
  "deliveryRiderDashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        "/deliveryrider/api/delivery_rider_dashboard_stats/"
      );
      return response.data; // only return plain JSON
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch delivery rider stats"
      );
    }
  }
);

const deliveryRiderStatsSlice = createSlice({
  name: "deliveryRiderDashboard",
  initialState: {
    stats: {
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
      .addCase(fetchDeliveryRiderStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryRiderStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.delivery_ride_analytics ||  state.stats;
      })
      .addCase(fetchDeliveryRiderStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch stats";
      });
  },
});

export default deliveryRiderStatsSlice.reducer;
