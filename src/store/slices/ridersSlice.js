import { createSlice } from '@reduxjs/toolkit';

const initialSalesmen = [
  {
    id: 'salesman1',
    name: 'Alex Johnson',
    phone: '+1555123456',
    email: 'alex@example.com',
    location: {
      lat: 40.7128,
      lng: -74.0060,
    },
    isOnline: true,
    totalShops: 3,
    totalOrders: 15,
  },
  {
    id: 'salesman2',
    name: 'Sarah Wilson',
    phone: '+1555654321',
    email: 'sarah@example.com',
    location: {
      lat: 40.7589,
      lng: -73.9851,
    },
    isOnline: true,
    totalShops: 2,
    totalOrders: 12,
  },
];

const salesmenSlice = createSlice({
  name: 'salesmen',
  initialState: {
    salesmen: initialSalesmen,
    currentSalesmanLocation: null,
  },
  reducers: {
    updateSalesmanLocation: (state, action) => {
      const { salesmanId, location } = action.payload;
      const salesman = state.salesmen.find(s => s.id === salesmanId);
      if (salesman) {
        salesman.location = location;
      }
      if (salesmanId === 'current') {
        state.currentSalesmanLocation = location;
      }
    },
    updateSalesmanStats: (state, action) => {
      const { salesmanId, shops, orders } = action.payload;
      const salesman = state.salesmen.find(s => s.id === salesmanId);
      if (salesman) {
        salesman.totalShops = shops;
        salesman.totalOrders = orders;
      }
    },
  },
});

export const { updateSalesmanLocation, updateSalesmanStats } = salesmenSlice.actions;
export default salesmenSlice.reducer;
