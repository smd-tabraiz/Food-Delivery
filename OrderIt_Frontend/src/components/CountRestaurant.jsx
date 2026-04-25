import React from 'react';
import { useSelector } from 'react-redux';

const CountRestaurant = () => {
    const { restaurants, showVegOnly, showNonVegOnly, showTopRated, showQuickDelivery } = useSelector((state) => state.restaurants);

    const filteredCount = restaurants ? restaurants.filter((restaurant) => {
        let passes = true;
        if (showVegOnly && !restaurant.isVeg) passes = false;
        if (showNonVegOnly && restaurant.isVeg) passes = false;
        if (showTopRated && (restaurant.ratings || 0) < 4) passes = false;
        if (showQuickDelivery && (restaurant.deliveryTime || 30) > 30) passes = false;
        return passes;
    }).length : 0;

    return (
        <div className="count-restaurant">
            <p id="Count_res">
                {filteredCount} {filteredCount === 1 ? 'Restaurant' : 'Restaurants'}
            </p>
        </div>
    );
};

export default CountRestaurant;
