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
        err.response?.data || "Failed to fetch nearby shops"
      );
    }
  }
);

const shopsSlice = createSlice({
  name: "shops",
  initialState: {
    shops: [], // ✅ shops manually registered by salesman
    nearbyShops: [], // ✅ shops fetched from API based on location
    loading: false,
    error: null,
  },
  reducers: {
    addShop: (state, action) => {
      const payload = action.payload;
      state.shops.push({
        ...payload,
        // if API already gives an id, use it
        id: payload.id || Date.now().toString(),
        registeredAt: payload.registeredAt || new Date().toISOString(),
      });
    },
    updateShop: (state, action) => {
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyShops.fulfilled, (state, action) => {
        state.nearbyShops = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
      })
      .addCase(fetchNearbyShops.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },

});

export const { addShop, updateShop, clearNearbyShops } = shopsSlice.actions;
export default shopsSlice.reducer;
