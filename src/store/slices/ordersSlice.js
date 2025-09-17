import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance";

// -------------------- CREATE ORDER --------------------
const createOrder = async (orderPayload) => {
  const response = await api.post(
    "/plants-mall-orders/api/orders/",
    orderPayload,
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

// -------------------- SUBMIT ORDER --------------------
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

// -------------------- FETCH ORDERS (with filters) --------------------
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (
    {
      page = 1,
      pageSize = 10,
      search,
      status,
      payment_status,
      start_date,
      end_date,
    } = {},
    { rejectWithValue, getState } // ✅ added getState
  ) => {
    try {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("page_size", pageSize);
      if(search) params.append("query", search);
      if (status) params.append("status", status);
      if (payment_status) params.append("payment_status", payment_status);
      if (start_date) params.append("start_date", start_date);
      if (end_date) params.append("end_date", end_date);

      const response = await api.get(
        `/plants-mall-orders/api/orders/?${params.toString()}`
      );

      return response.data; // {results, count, next, previous}
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch orders");
    }
  }
);


// -------------------- UPDATE ORDER (status / payment) --------------------
export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ orderId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/plants-mall-orders/api/orders/${orderId}/`,
        updates
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update order");
    }
  }
);

// -------------------- SLICE --------------------
const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    count: 0,
    next: null,
    previous: null,
    loading: false,
    error: null,
    updating: false,
    page: 1,
    pageSize: 10,
  },

  reducers: {
    // Optimistic local add
    addOrder: (state, action) => {
      state.orders.push({
        ...action.payload,
        id: Date.now().toString(),
        status: "pending",
        createdAt: new Date().toISOString(),
        voiceNotes: action.payload.voiceNotes || [],
      });
    },

    // Local update status
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = status;
      }
    },

    markOrderReady: (state, action) => {
      const order = state.orders.find((o) => o.id === action.payload);
      if (order) {
        order.status = "ready";
        order.readyAt = new Date().toISOString();
      }
    },

    addVoiceNote: (state, action) => {
      const { orderId, note } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        if (!order.voiceNotes) order.voiceNotes = [];
        order.voiceNotes.push(note);
      }
    },

    setPage: (state, action) => {
      state.page = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // create order
      .addCase(submitorder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitorder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
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
        state.orders = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update order
      .addCase(updateOrder.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.updating = false;
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) {
          state.orders[idx] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const {
  addOrder,
  updateOrderStatus,
  markOrderReady,
  addVoiceNote,
  setPage,
} = ordersSlice.actions;

export default ordersSlice.reducer;
