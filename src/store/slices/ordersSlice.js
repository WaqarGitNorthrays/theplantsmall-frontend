import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance";

// Create order API call with FormData
const createOrder = async (orderPayload) => {
  const response = await api.post(
    "/plants-mall-orders/api/orders/",
    orderPayload, // can be FormData (with files) or plain JSON
    {
      headers: {
        "Content-Type":
          orderPayload instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    }
  );
  return response.data;
};

// Async thunk to submit an order
export const submitorder = createAsyncThunk(
  "orders/submitOrder",
  async (orderPayload, { rejectWithValue }) => {
    try {
      const response = await createOrder(orderPayload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to create order");
    }
  }
);

// Async thunk to fetch orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/plants-mall-orders/api/orders/");
      console.log("Orders fetched:", response.data);
      return response.data.results;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch orders");
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },

  reducers: {
    // Add new order (local optimistic update)
    addOrder: (state, action) => {
      state.orders.push({
        ...action.payload,
        id: Date.now().toString(),
        status: "pending",
        createdAt: new Date().toISOString(),
        voiceNotes: action.payload.voiceNotes || [],
      });
    },

    // Update order status
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find((order) => order.id === orderId);
      if (order) {
        order.status = status;
        if (status === "ready") {
          order.readyAt = new Date().toISOString();
        }
      }
    },

    // Mark order ready
    markOrderReady: (state, action) => {
      const order = state.orders.find((order) => order.id === action.payload);
      if (order) {
        order.status = "ready";
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
        order.voiceNotes.push(note);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // submit order
      .addCase(submitorder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitorder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload); // push backend response
      })
      .addCase(submitorder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addOrder, updateOrderStatus, markOrderReady, addVoiceNote } =
  ordersSlice.actions;

export default ordersSlice.reducer;
