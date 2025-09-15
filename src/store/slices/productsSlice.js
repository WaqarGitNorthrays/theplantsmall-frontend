// src/store/slices/productsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance.js";

// -------------------- FETCH PRODUCTS --------------------
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ page, pageSize }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `plants-mall-products/api/products/?page=${page}&page_size=${pageSize}`
      );
      console.log("Fetched products:", response.data);

      let products = [];

      if (Array.isArray(response.data.results)) {
        products = response.data.results;
      } else if (Array.isArray(response.data.results?.results)) {
        products = response.data.results.results; // nested case
      } else if (Array.isArray(response.data)) {
        products = response.data;
      }

      return {
        products,
        count: response.data.count || products.length || 0,
      };
    } catch (err) {
      console.error("Fetch products error:", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);



// -------------------- ADD PRODUCT --------------------
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "plants-mall-products/api/products/",
        productData // ✅ FormData handled automatically by axios
      );
      return response.data;
    } catch (err) {
      console.error("Add product error:", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    count: 0,
    loading: false,
    error: null,
    adding: false,
  },
  reducers: {
    clearProducts: (state) => {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.count = action.payload.count;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Add product
      .addCase(addProduct.pending, (state) => {
        state.adding = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.adding = false;
        // API returns single product object
        if (action.payload) {
          state.products.unshift(action.payload);
        }
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.adding = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
