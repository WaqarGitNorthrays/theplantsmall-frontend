// store/slices/shopsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance";

// ✅ Helper for rounding
const roundTo6 = (num) => parseFloat(num.toFixed(6));

export const fetchNearbyShops = createAsyncThunk(
  "shops/fetchNearby",
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      const res = await api.get("/plants-mall-shops/api/shops/nearby/", {
        params: {
          lat: roundTo6(lat),
          lng: roundTo6(lng),
        },
      });

      // ✅ Extract shops from results
      return res.data?.results || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch nearby shops");
    }
  }
);

const shopsSlice = createSlice({
  name: "shops",
  initialState: {
    shops: [],        // manually registered shops (local)
    nearbyShops: [],  // fetched from API
    loading: false,
    error: null,
  },
  reducers: {
    addShop: (state, action) => {
      state.shops.push({
        ...action.payload,
        id: Date.now().toString(),
        registeredAt: new Date().toISOString(),
      });
    },
    updateShop: (state, action) => {
      const index = state.shops.findIndex((shop) => shop.id === action.payload.id);
      if (index !== -1) {
        state.shops[index] = { ...state.shops[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyShops.fulfilled, (state, action) => {
        state.nearbyShops = action.payload; // ✅ now always an array
        state.loading = false;
      })
      .addCase(fetchNearbyShops.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { addShop, updateShop } = shopsSlice.actions;
export default shopsSlice.reducer;
