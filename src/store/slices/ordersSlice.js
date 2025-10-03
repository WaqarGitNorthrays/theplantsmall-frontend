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
      shop_id,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("page_size", pageSize);
      if (search) params.append("query", search);
      if (status) params.append("status", status);
      if (payment_status) params.append("payment_status", payment_status);
      if (start_date) params.append("start_date", start_date);
      if (end_date) params.append("end_date", end_date);
      if (shop_id) params.append("shop_id", shop_id);

      const response = await api.get(
        `/plants-mall-orders/api/orders/?${params.toString()}`
      );

      return response.data; // {results, count, next, previous}
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch orders");
    }
  }
);

// -------------------- UPDATE ORDER --------------------
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

// -------------------- ASSIGN RIDER --------------------
export const assignRiderToOrder = createAsyncThunk(
  "orders/assignRider",
  async ({ orderId, riderId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/plants-mall-orders/api/orders/${orderId}/`,
        { rider: riderId }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to assign rider");
    }
  }
);

// -------------------- PATCH STATUS --------------------
export const patchOrderStatus = createAsyncThunk(
  "orders/patchStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(
        `/plants-mall-orders/api/orders/${orderId}/`,
        { status }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update status");
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
    lastOrder: null,
  },

  reducers: {
    addOrder: (state, action) => {
      state.orders.push({
        ...action.payload,
        id: Date.now().toString(),
        status: "pending",
        createdAt: new Date().toISOString(),
        voiceNotes: action.payload.voiceNotes || [],
      });
    },

    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find((o) => String(o.id) === String(orderId));
      if (order) order.status = status;
    },

    markOrderReady: (state, action) => {
      const order = state.orders.find(
        (o) => String(o.id) === String(action.payload)
      );
      if (order) {
        order.status = "ready";
        order.readyAt = new Date().toISOString();
      }
    },

    addVoiceNote: (state, action) => {
      const { orderId, note } = action.payload;
      const order = state.orders.find((o) => String(o.id) === String(orderId));
      if (order) {
        if (!order.voiceNotes) order.voiceNotes = [];
        order.voiceNotes.push(note);
      }
    },

    setPage: (state, action) => {
      state.page = action.payload;
    },
     setLastOrder: (state, action) => {
      state.lastOrder = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // submit order
      .addCase(submitorder.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
    .addCase(submitorder.fulfilled, (s, a) => {
      s.loading = false;
      s.orders.unshift(a.payload); // newest first
      s.lastOrder = a.payload;     // ✅ store latest order
    })

      .addCase(submitorder.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // fetch orders
      .addCase(fetchOrders.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        s.loading = false;
        const payload = a.payload;

        if (Array.isArray(payload)) {
          // Fallback for non-paginated array response (rarely hit)
          s.orders = payload; // Always replace
          s.count = payload.length;
          s.next = null;
          s.previous = null;
        } else {
          // Standard paginated response
          const newOrders = payload?.results || [];
          s.orders = newOrders; // KEY FIX: Always replace, no append
          s.count = payload?.count ?? 0;
          s.next = payload?.next ?? null;
          s.previous = payload?.previous ?? null;
        }
      })
      .addCase(fetchOrders.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // update order
      .addCase(updateOrder.pending, (s) => {
        s.updating = true;
        s.error = null;
      })
      .addCase(updateOrder.fulfilled, (s, a) => {
        s.updating = false;
        const idx = s.orders.findIndex(
          (o) => String(o.id) === String(a.payload.id)
        );
        if (idx !== -1) {
          s.orders[idx] = { ...s.orders[idx], ...a.payload };
        }
      })
      .addCase(updateOrder.rejected, (s, a) => {
        s.updating = false;
        s.error = a.payload;
      })

      // assign rider
      .addCase(assignRiderToOrder.pending, (s) => {
        s.updating = true;
        s.error = null;
      })
      .addCase(assignRiderToOrder.fulfilled, (s, a) => {
        s.updating = false;
        const idx = s.orders.findIndex(
          (o) => String(o.id) === String(a.payload.id)
        );
        if (idx !== -1) s.orders[idx] = { ...s.orders[idx], ...a.payload };
      })
      .addCase(assignRiderToOrder.rejected, (s, a) => {
        s.updating = false;
        s.error = a.payload;
      })

      // patch status
      .addCase(patchOrderStatus.pending, (s) => {
        s.updating = true;
        s.error = null;
      })
      .addCase(patchOrderStatus.fulfilled, (s, a) => {
        s.updating = false;
        const idx = s.orders.findIndex(
          (o) => String(o.id) === String(a.payload.id)
        );
        if (idx !== -1) s.orders[idx] = { ...s.orders[idx], ...a.payload };
      })
      .addCase(patchOrderStatus.rejected, (s, a) => {
        s.updating = false;
        s.error = a.payload;
      });

  },
});

export const {
  addOrder,
  updateOrderStatus,
  markOrderReady,
  addVoiceNote,
  setPage,
  setLastOrder,
} = ordersSlice.actions;

export default ordersSlice.reducer;
