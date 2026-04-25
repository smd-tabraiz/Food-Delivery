import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api"; 

//GET MENUS
export const getMenus = createAsyncThunk(
  "menus/getMenus",
  async (id, { rejectWithValue }) => {
    try {
      const cacheKey = `menu_${id}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        console.log("Serving menu from cache");
        return JSON.parse(cachedData);
      }

      const response = await API.get(`/v1/eats/stores/${id}/menus`);

      let menuData = [];
      let menuDocId = null;
      console.log("getMenus response", response);
      if (response.data.data && response.data.data.length > 0) {
        menuDocId = response.data.data[0]._id;
        menuData = response.data.data[0].menu;
      }

      const payload = { menu: menuData, menuId: menuDocId };
      sessionStorage.setItem(cacheKey, JSON.stringify(payload));

      return payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

//CREATE MENU
export const createMenu = createAsyncThunk(
  "menus/createMenu",
  async ({ restaurantId, category }, { rejectWithValue }) => {
    try {
      const body = {
        restaurant: restaurantId,
        menu: [{ category, items: [] }],
      };

      const { data } = await API.post(
        `/v1/eats/stores/${restaurantId}/menus`,
        body,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

//ADD ITEM
export const addItemToMenu = createAsyncThunk(
  "menus/addItemToMenu",
  async (
    { menuId, category, foodItemId, restaurantId },
    { rejectWithValue }
  ) => {
    try {
      const body = { category, foodItemId };

      const { data } = await API.patch(
        `/v1/eats/stores/${restaurantId}/menus/${menuId}/addItem`,
        body,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);