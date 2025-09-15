import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import shopsSlice from './slices/shopsSlice';
import ordersSlice from './slices/ordersSlice';
import salesmenSlice from './slices/ridersSlice';
import productsSlice from './slices/productsSlice';
import dashboardSlice from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    shops: shopsSlice,
    orders: ordersSlice,
    salesmen: salesmenSlice,
    products: productsSlice,
    dashboard: dashboardSlice,
  },
});

export default store;