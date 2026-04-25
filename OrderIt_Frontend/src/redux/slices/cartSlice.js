import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    restaurant: {},
    loading: false,
    error: null,
  },
  reducers: {
    fetchCartRequest: (state) => {
      state.loading = true;
    },
    fetchCartSuccess: (state, action) => {
      state.loading = false;
      state.cartItems = action.payload.items || [];
      state.restaurant = action.payload.restaurant || {};
    },
    fetchCartFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateCartItems: (state, action) => {
      state.cartItems = action.payload.items || [];
      state.restaurant = action.payload.restaurant || {};
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.restaurant = {};
    },
  },
});

export const {
  fetchCartRequest,
  fetchCartSuccess,
  fetchCartFail,
  updateCartItems,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
