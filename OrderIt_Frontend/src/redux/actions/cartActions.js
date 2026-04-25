import api from "../../utils/api";
import {
  fetchCartRequest,
  fetchCartSuccess,
  fetchCartFail,
  updateCartItems,
} from "../slices/cartSlice";

// Add item to cart
export const addItemToCart = (foodItemId, restaurant, quantity) => async (dispatch, getState) => {
  try {
    const { user } = getState().user;
    if (!user) return;

    const { data } = await api.post("/v1/eats/cart/add-to-cart", {
      userId: user._id,
      foodItemId,
      restaurantId: restaurant._id || restaurant,
      quantity,
    });

    dispatch(updateCartItems({
      items: data.cart.items,
      restaurant: data.cart.restaurant
    }));
  } catch (error) {
    console.error("Add to cart error:", error);
  }
};

// Fetch cart items
export const fetchCartItems = () => async (dispatch, getState) => {
  try {
    dispatch(fetchCartRequest());
    const { data } = await api.get("/v1/eats/cart/get-cart");

    dispatch(fetchCartSuccess({
      items: data.data.items,
      restaurant: data.data.restaurant
    }));
  } catch (error) {
    dispatch(fetchCartFail(error.response?.data?.message || error.message));
  }
};

// Remove item from cart
export const removeItemFromCart = (foodItemId) => async (dispatch, getState) => {
  try {
    const { user } = getState().user;
    if (!user) return;

    const { data } = await api.delete("/v1/eats/cart/delete-cart-item", {
      data: { userId: user._id, foodItemId }
    });

    if (data.message === "Cart deleted") {
      dispatch(updateCartItems({ items: [], restaurant: {} }));
    } else {
      dispatch(updateCartItems({
        items: data.cart.items,
        restaurant: data.cart.restaurant
      }));
    }
  } catch (error) {
    console.error("Remove from cart error:", error);
  }
};

// Update cart quantity
export const updateCartQuantity = (foodItemId, quantity) => async (dispatch, getState) => {
  try {
    const { user } = getState().user;
    if (!user) return;

    const { data } = await api.post("/v1/eats/cart/update-cart-item", {
      userId: user._id,
      foodItemId,
      quantity,
    });

    dispatch(updateCartItems({
      items: data.cart.items,
      restaurant: data.cart.restaurant
    }));
  } catch (error) {
    console.error("Update cart error:", error);
  }
};
