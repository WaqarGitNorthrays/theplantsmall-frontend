// src/store/slices/usersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance.js";

// Fetch users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("admin_operations/api/staff-users/");
      return {
        users: res.data.results || [],
        count: res.data.count || 0,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Add user
export const addUser = createAsyncThunk(
  "users/addUser",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("auth/api/register/", userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    count: 0,
    loading: false,
    adding: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.count = action.payload.count;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Add
      .addCase(addUser.pending, (state) => {
        state.adding = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.adding = false;
        state.users.unshift(action.payload); // add new user to list
        state.count += 1;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.adding = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default usersSlice.reducer;
