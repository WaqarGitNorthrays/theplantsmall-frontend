// src/store/slices/usersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance.js";

// Fetch users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (pageUrl = "admin_operations/api/staff-users/", { rejectWithValue }) => {
    try {
      const res = await api.get(pageUrl);
      return {
        users: res.data.results || [],
        count: res.data.count || 0,
        next: res.data.next,
        previous: res.data.previous,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch single user detail
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`auth/api/user_detail/${id}/`);
      return res.data;
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

// Update user
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`auth/api/user/${id}/`, updates);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`auth/api/user/${id}/`);
      return id; // return deleted user id
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
    selectedUser: null,
    next: null,
    previous: null,
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
        state.next = action.payload.next;
        state.previous = action.payload.previous;
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
      })

      // Update user
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx] = { ...state.users[idx], ...action.payload };
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
        state.count -= 1;
      })

      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default usersSlice.reducer;
