// src/store/slices/ridersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance";

export const fetchRiders = createAsyncThunk(
  "riders/fetchRiders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/dispatcher/api/delivery_rider/");
      return res.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch riders");
    }
  }
);

const ridersSlice = createSlice({
  name: "riders",
  initialState: {
    riders: [],
    count: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRiders.pending, (s) => {
        s.loading = true; s.error = null;
      })
      .addCase(fetchRiders.fulfilled, (s, a) => {
        s.loading = false;
        s.riders = a.payload.results || [];
        s.count = a.payload.count ?? s.riders.length;
      })
      .addCase(fetchRiders.rejected, (s, a) => {
        s.loading = false; s.error = a.payload;
      });
  },
});

export default ridersSlice.reducer;
