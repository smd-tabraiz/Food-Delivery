import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (sessionId, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/v1/eats/orders/new", { session_id: sessionId });
      return data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

export const myOrders = createAsyncThunk(
  "order/myOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/v1/eats/orders/me/myOrders");
      return data.orders;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  "order/getOrderDetails",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/v1/eats/orders/${id}`);
      return data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order details"
      );
    }
  }
);

// ADMIN: get all orders
export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/v1/eats/orders/admin/all");
      return data.orders;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all orders"
      );
    }
  }
);

// ADMIN: update order status
export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/v1/eats/orders/admin/${id}`, { orderStatus: status });
      return { id, status };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }
);
