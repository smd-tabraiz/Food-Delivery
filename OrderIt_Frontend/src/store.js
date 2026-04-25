import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./redux/slices/restaurantSlice";
import menuReducer from "./redux/slices/menuSlice";
import userReducer from "./redux/slices/userSlice";
import cartReducer from "./redux/slices/cartSlice";
import orderReducer from "./redux/slices/orderSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    restaurants: restaurantReducer,
    menus: menuReducer,
    cart: cartReducer,
    order: orderReducer,
  },
});

export default store;
