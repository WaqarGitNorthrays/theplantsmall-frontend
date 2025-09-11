import { createSlice } from '@reduxjs/toolkit';

const initialOrders = [
  {
    id: '1',
    shopId: '1',
    salesmanId: 'salesman1', // 🟢 changed from riderId
    items: [
      { name: 'Fresh Tomatoes', quantity: 5, price: 12.5 },
      { name: 'Organic Lettuce', quantity: 2, price: 8.0 },
    ],
    totalAmount: 20.5,
    status: 'pending',
    orderType: 'text',
    notes: 'Please pack carefully',
    createdAt: new Date('2024-01-25T10:30:00').toISOString(),
    location: {
      lat: 40.7128,
      lng: -74.006,
    },
    voiceNotes: [], // 🔊 Added
  },
  {
    id: '2',
    shopId: '2',
    salesmanId: 'salesman2', // 🟢 changed from riderId
    items: [
      { name: 'Fresh Basil', quantity: 3, price: 15.0 },
      { name: 'Cherry Tomatoes', quantity: 4, price: 18.0 },
    ],
    totalAmount: 33.0,
    status: 'ready',
    orderType: 'voice',
    notes: 'Voice order transcription',
    createdAt: new Date('2024-01-25T11:15:00').toISOString(),
    readyAt: new Date('2024-01-25T11:45:00').toISOString(),
    location: {
      lat: 40.7589,
      lng: -73.9851,
    },
    voiceNotes: ['blob:http://localhost:3000/xyz123'], // Example placeholder
  },
];

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: initialOrders,
    loading: false,
  },
  reducers: {
    // ➕ Add new order (with voice notes support)
    addOrder: (state, action) => {
      state.orders.push({
        ...action.payload,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        voiceNotes: action.payload.voiceNotes || [], // 🔊 Store as-is
      });
    },

    // 🔄 Update order status
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find((order) => order.id === orderId);
      if (order) {
        order.status = status;
        if (status === 'ready') {
          order.readyAt = new Date().toISOString();
        }
      }
    },

    // ✅ Mark order ready
    markOrderReady: (state, action) => {
      const order = state.orders.find((order) => order.id === action.payload);
      if (order) {
        order.status = 'ready';
        order.readyAt = new Date().toISOString();
      }
    },

    // 🎤 Add a voice note to an existing order
    addVoiceNote: (state, action) => {
      const { orderId, note } = action.payload;
      const order = state.orders.find((order) => order.id === orderId);
      if (order) {
        if (!order.voiceNotes) {
          order.voiceNotes = [];
        }
        order.voiceNotes.push(note); // Keep raw blob/base64/URL
      }
    },
  },
});

export const { addOrder, updateOrderStatus, markOrderReady, addVoiceNote } =
  ordersSlice.actions;
export default ordersSlice.reducer;
