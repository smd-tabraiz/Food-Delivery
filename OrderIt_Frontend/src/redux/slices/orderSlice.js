import { createSlice } from "@reduxjs/toolkit";
import { myOrders, createOrder, getOrderDetails, getAllOrders, updateOrderStatus } from "../actions/orderActions";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    order: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    updateOrderFromSocket: (state, action) => {
      const { orderId, status } = action.payload;
      // Update in orders list
      if (state.orders) {
        const orderIndex = state.orders.findIndex((o) => o._id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].orderStatus = status;
        }
      }
      // Update current viewed order
      if (state.order && state.order._id === orderId) {
        state.order.orderStatus = status;
      }
    },
  },
  extraReducers: (builder) => {
    // myOrders
    builder.addCase(myOrders.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(myOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(myOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // createOrder
    builder.addCase(createOrder.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.order = action.payload;
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // getOrderDetails
    builder.addCase(getOrderDetails.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getOrderDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.order = action.payload;
    });
    builder.addCase(getOrderDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // getAllOrders (Admin)
    builder.addCase(getAllOrders.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(getAllOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // updateOrderStatus (Admin)
    builder.addCase(updateOrderStatus.pending, (state) => {
      // Don't set loading to true here to avoid flickering the table during update
    });
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      // Optionally update the specific order locally, but getAllOrders handles the refresh
    });
    builder.addCase(updateOrderStatus.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export const { clearErrors, updateOrderFromSocket } = orderSlice.actions;
export default orderSlice.reducer;
