import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import shopsSlice from './slices/shopsSlice';
import ordersSlice from './slices/ordersSlice';
import salesmenSlice from './slices/salesmanSlice';
import productsSlice from './slices/productsSlice';
import dashboardSlice from './slices/dashboardSlice';
import usersSlice from './slices/usersSlice';
import riderSlice from './slices/riderSlice';
import dispatcherStatsSlice from './slices/dispatcherStatsSlice';
import { injectStore } from '../utils/axiosInstance';
import deliveryRiderStatsSlice from './slices/deliveryRiderStatsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    shops: shopsSlice,
    orders: ordersSlice,
    salesmen: salesmenSlice,
    products: productsSlice,
    dashboard: dashboardSlice,
    users: usersSlice,
    riders: riderSlice,
    dispatcherStats: dispatcherStatsSlice,
    deliveryRiderStats: deliveryRiderStatsSlice,
  },
});

injectStore(store);

export default store;