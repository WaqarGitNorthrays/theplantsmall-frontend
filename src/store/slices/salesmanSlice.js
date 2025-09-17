// store/slices/ridersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const salesmenSlice = createSlice({
  name: "salesmen",
  initialState: {
    salesmen: [], 
    currentSalesmanLocation: null, //logged-in salesman
  },
  reducers: {
    // ✅ Update *logged-in* salesman location
    updateSalesmanLocation: (state, action) => {
      const { salesmanId, location } = action.payload;

      // update current salesman
      state.currentSalesmanLocation = location;

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
      const salesman = state.salesmen.find((s) => s.id === salesmanId);
      if (salesman) {
        salesman.isOnline = false;
      }
    },

    // ✅ Replace salesmen list (for admin dashboards, etc.)
    setSalesmen: (state, action) => {
      state.salesmen = action.payload;
    },
  },
});

export const {
  updateSalesmanLocation,
  updateSalesmanStats,
  setSalesmanOffline,
  setSalesmen,
} = salesmenSlice.actions;

export default salesmenSlice.reducer;
