import { createSlice } from "@reduxjs/toolkit";
import { getRestaurants, createRestaurant,deleteRestaurant, analyzeReviews } from "../actions/restaurantAction";

const initialState = {
    restaurants : [],
    originalRestaurants: [],
    count : 0,
    loading : false,
    error : null,
    showVegOnly : false,
    showNonVegOnly : false,
    showTopRated : false,
    showQuickDelivery : false,
    activeSort: null,
    pureVegRestaurantsCount : 0,
    creating: false,      
    createError: null,
    deleting: false,
    deleteError: null
}

const restaurantSlice = createSlice({
    name: "restaurants",
    initialState,
    reducers : {
        sortByRatings:(state) =>{
            if (state.activeSort === "ratings") {
                state.restaurants = [...state.originalRestaurants];
                state.activeSort = null;
            } else {
                state.restaurants.sort((a,b) => b.ratings - a.ratings);
                state.activeSort = "ratings";
            }
        },
        sortByReviews:(state) =>{
            if (state.activeSort === "reviews") {
                state.restaurants = [...state.originalRestaurants];
                state.activeSort = null;
            } else {
                state.restaurants.sort((a,b) => b.numOfReviews - a.numOfReviews);
                state.activeSort = "reviews";
            }
        },
        toggleVegOnly:(state) =>{
            state.showVegOnly = !state.showVegOnly;
            if (state.showVegOnly) state.showNonVegOnly = false;
        },
        toggleNonVegOnly:(state) =>{
            state.showNonVegOnly = !state.showNonVegOnly;
            if (state.showNonVegOnly) state.showVegOnly = false;
        },
        toggleTopRated:(state) =>{
            state.showTopRated = !state.showTopRated;
        },
        toggleQuickDelivery:(state) =>{
            state.showQuickDelivery = !state.showQuickDelivery;
        },
        clearAllFilters:(state) =>{
            state.showVegOnly = false;
            state.showNonVegOnly = false;
            state.showTopRated = false;
            state.showQuickDelivery = false;
            state.activeSort = null;
            state.restaurants = [...state.originalRestaurants];
        },
        clearError:(state) =>{
            state.error = null;
        }
    },

    extraReducers : (builder) =>{
        builder
        //GET
        .addCase(getRestaurants.pending,(state) =>{
            state.loading = true;
        })
        .addCase(getRestaurants.fulfilled,(state,action) =>{
            state.loading = false;
            state.restaurants = action.payload.restaurants;
            state.originalRestaurants = action.payload.restaurants;
            state.count = action.payload.count;
            state.activeSort = null;
        })
        .addCase(getRestaurants.rejected,(state,action) =>{
            state.loading = false;
            state.error = action.payload || "Failed to fetch restaurants";
        })

        // CREATE
        // CREATE
.addCase(createRestaurant.pending, (state) => {
    state.creating = true;
    state.createError = null;
})

.addCase(createRestaurant.fulfilled, (state, action) => {
    state.creating = false;

    state.restaurants.push(action.payload.data);
    state.count += 1;
})

.addCase(createRestaurant.rejected, (state, action) => {
    state.creating = false;
    state.createError = action.payload;
})

// DELETE
.addCase(deleteRestaurant.pending, (state) => {
    state.deleting = true;
    state.deleteError = null;
})

.addCase(deleteRestaurant.fulfilled, (state, action) => {
    state.deleting = false;

    // remove restaurant from state
    state.restaurants = state.restaurants.filter(
        (rest) => rest._id !== action.payload.id
    );

    state.count -= 1;
})

.addCase(deleteRestaurant.rejected, (state, action) => {
    state.deleting = false;
    state.deleteError = action.payload;
})


// ANALYZE REVIEWS
      .addCase(analyzeReviews.pending, (state) => {
        state.loading = true;
      })

      .addCase(analyzeReviews.fulfilled, (state, action) => {
        state.loading = false;

        const { restaurantId, aiData } = action.payload;

        const restaurant = state.restaurants.find(
          (r) => r._id === restaurantId
        );

        if (restaurant) {
          restaurant.reviewSentiment = aiData.sentiment;
          restaurant.reviewSummaryBullets =
            aiData.summaryBullets;
          restaurant.reviewTopMentions =
            aiData.topMentions;
        }
      })

      .addCase(analyzeReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  
     }

})
export const {
    sortByRatings,
    sortByReviews,
    toggleVegOnly,
    toggleNonVegOnly,
    toggleTopRated,
    toggleQuickDelivery,
    clearAllFilters,
    clearError,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;

//helper 
const calculatePureVegCount = (restaurants,showVegOnly) =>{

    if(!showVegOnly)return restaurants.length;

    return restaurants.filter(restaurant => restaurant.isVeg).length;
}