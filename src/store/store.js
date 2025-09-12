import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import shopsSlice from './slices/shopsSlice';
import ordersSlice from './slices/ordersSlice';
import salesmenSlice from './slices/ridersSlice';
import productsSlice from './slices/productsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    shops: shopsSlice,
    orders: ordersSlice,
    salesmen: salesmenSlice,
    products: productsSlice,
  },
});

export default store;