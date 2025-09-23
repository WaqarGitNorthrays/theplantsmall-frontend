// store/slices/shopsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance";

// ✅ Async thunk: Fetch nearby shops from API
export const fetchNearbyShops = createAsyncThunk(
  "shops/fetchNearby",
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      const res = await api.get("/plants-mall-shops/api/shops/nearby/", {
        params: { lat, lng },
      });
      return res.data.results || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to fetch nearby shops"
      );
    }
  }
);
export const fetchAllShops = createAsyncThunk(
  "shops/fetchAll",
  async (page = 1, { rejectWithValue }) => {
    try {
      const res = await api.get("/plants-mall-shops/api/shops/", {
        params: { page },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to fetch shops"
      );
    }
  }
);

export const fetchShopById = createAsyncThunk(
  "shops/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/plants-mall-shops/api/shops/${id}/edit/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || "Failed to fetch shop"
      );
    }
  }
);




const shopsSlice = createSlice({
  name: "shops",
  initialState: {
    shops: [], // ✅ manually registered shops
    nearbyShops: [], // ✅ API fetched shops
     selectedShop: null,
    loading: false,
    error: null,
    lastFetched: null, // ✅ timestamp for last fetch
    totalCount: 0,
    next: null,
    previous: null,
    currentPage: 1,
  },
  reducers: {
    addShop: (state, action) => {
      state.error = null; // clear stale errors
      const payload = action.payload;
      state.shops.push({
        ...payload,
        id: payload.id || Date.now().toString(), // fallback id
        registeredAt: payload.registeredAt || new Date().toISOString(),
      });
    },
    updateShop: (state, action) => {
      state.error = null;
      const index = state.shops.findIndex(
        (shop) => shop.id === action.payload.id
      );
      if (index !== -1) {
        state.shops[index] = {
          ...state.shops[index],
          ...action.payload,
        };
      }
    },
    clearNearbyShops: (state) => {
      state.nearbyShops = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

    // Nearby Shops for Salesman
      .addCase(fetchNearbyShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyShops.fulfilled, (state, action) => {
        const shops = Array.isArray(action.payload) ? action.payload : [];

        // ✅ deduplicate by shop.id
        const unique = shops.filter(
          (shop, index, self) =>
            index === self.findIndex((s) => s.id === shop.id)
        );

        state.nearbyShops = unique;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchNearbyShops.rejected, (state, action) => {
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "Unknown error";
        state.loading = false;
      })

      // All Shops for Admin
      .addCase(fetchAllShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllShops.fulfilled, (state, action) => {
        state.loading = false;
        state.shops = action.payload.results || [];
        state.totalCount = action.payload.count || 0;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchAllShops.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "Unknown error";
      })

      // fetchShopById
       .addCase(fetchShopById.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.selectedShop = null;
      })
      .addCase(fetchShopById.fulfilled, (s, a) => {
        s.loading = false;
        s.selectedShop = a.payload;
      })
      .addCase(fetchShopById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const { addShop, updateShop, clearNearbyShops } = shopsSlice.actions;
export default shopsSlice.reducer;
