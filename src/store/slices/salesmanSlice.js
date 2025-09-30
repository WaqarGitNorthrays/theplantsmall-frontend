// store/slices/salesmenSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance";

// Thunk to fetch salesman stats
export const fetchSalesmanStats = createAsyncThunk(
  "salesmen/fetchStats",
  async (salesmanId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/plants-mall-shops/api/salesman_stats/stats/`
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch salesman stats"
      );
    }
  }
);

const salesmenSlice = createSlice({
  name: "salesmen",
  initialState: {
    salesmen: [], // list of all salesmen (for admin dashboards, etc.)
    locations: {}, // 🔑 salesmanId → latest location
    currentSalesmanLocation: null, // logged-in salesman location
    stats: {
      total_shops_by_user: 0,
      total_orders: 0,
      today_orders: 0,
    },
    statsLoading: false,
    statsError: null,
  },
  reducers: {
    // ✅ Update salesman location (both logged-in + map of all salesmen)
    updateSalesmanLocation: (state, action) => {
      const { salesmanId, location } = action.payload;

      // update logged-in salesman’s location
      state.currentSalesmanLocation = location;

      // update global locations map
      state.locations[salesmanId] = location;

      // also update inside salesmen list if present
      const salesman = state.salesmen.find((s) => s.id === salesmanId);
      if (salesman) {
        salesman.location = location;
        salesman.isOnline = true;
      }
    },

    // ✅ Update salesman stats (shops/orders)
    updateSalesmanStats: (state, action) => {
      const { salesmanId, shops, orders } = action.payload;
      const salesman = state.salesmen.find((s) => s.id === salesmanId);
      if (salesman) {
        salesman.totalShops = shops;
        salesman.totalOrders = orders;
      }
    },

    // ✅ Mark salesman offline
    setSalesmanOffline: (state, action) => {
      const salesmanId = action.payload;

      // update list
      const salesman = state.salesmen.find((s) => s.id === salesmanId);
      if (salesman) {
        salesman.isOnline = false;
      }

      // also clear from locations map
      delete state.locations[salesmanId];
    },

    // ✅ Replace salesmen list (for admin dashboards, etc.)
    setSalesmen: (state, action) => {
      state.salesmen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesmanStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchSalesmanStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats =
          action.payload || {
            total_shops_by_user: 0,
            total_orders: 0,
            today_orders: 0,
          };
      })
      .addCase(fetchSalesmanStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload || "Failed to fetch stats";
      });
  },
});

export const {
  updateSalesmanLocation,
  updateSalesmanStats,
  setSalesmanOffline,
  setSalesmen,
} = salesmenSlice.actions;

export default salesmenSlice.reducer;
