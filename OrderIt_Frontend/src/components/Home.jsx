import React, { useEffect, useState } from "react";
import {
  sortByRatings,
  sortByReviews,
  toggleVegOnly,
  toggleNonVegOnly,
  toggleTopRated,
  toggleQuickDelivery,
  clearAllFilters,
} from "../redux/slices/restaurantSlice";

import { createRestaurant, getRestaurants } from "../redux/actions/restaurantAction";
import Restaurant from "./Restaurant";
import SkeletonRestaurant from "./layout/SkeletonRestaurant";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import CountRestaurant from "./CountRestaurant";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Home = () => {
  const dispatch = useDispatch();
  const { keyword } = useParams();
  const {
    loading: restaurantsLoading,
    error: restaurantsError,
    restaurants,
    showVegOnly,
    showNonVegOnly,
    showTopRated,
    showQuickDelivery,
    activeSort,
    creating,
    createError,
  } = useSelector((state) => state.restaurants);

  const {
    loading: authLoading,
    isAuthenticated,
    user,
  } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getRestaurants(keyword));
  }, [dispatch, keyword]);

  useEffect(() => {
    if (restaurantsError) {
      toast.error(restaurantsError);
    }
  }, [restaurantsError]);

  const handleSortByRatings = () => {
    dispatch(sortByRatings());
  };

  const handleSortByReviews = () => {
    dispatch(sortByReviews());
  };

  const handleClearAllFilters = () => {
    dispatch(clearAllFilters());
  };

  // admin controls
  const [showCreate, setShowCreate] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    address: "",
    isVeg: false,
    location: { type: "Point", coordinates: [] },
    imageUrl: "",
  });
  const [coordsInput, setCoordsInput] = React.useState("");

  const handleOpenCreate = () => {
    setCoordsInput(newRestaurant.location.coordinates.join(","));
    setShowCreate(true);
  };

  const handleCloseCreate = () => {
    setShowCreate(false);
    setCoordsInput("");
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "isVeg") {
      setNewRestaurant({ ...newRestaurant, isVeg: checked });
    } else if (name === "coordinates") {
      setCoordsInput(value);

      const parts = value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v !== "");

      const coords = parts.map((v) => parseFloat(v)).filter((n) => !isNaN(n));

      setNewRestaurant({
        ...newRestaurant,
        location: { ...newRestaurant.location, coordinates: coords },
      });
    } else if (name === "imageUrl") {
      setNewRestaurant({ ...newRestaurant, imageUrl: value });
    } else {
      setNewRestaurant({ ...newRestaurant, [name]: value });
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();

    const payload = {
      name: newRestaurant.name,
      address: newRestaurant.address,
      isVeg: newRestaurant.isVeg,
      location: newRestaurant.location,
      images: [
        {
          public_id: "default",
          url: newRestaurant.imageUrl,
        },
      ],
    };

    const result = await dispatch(createRestaurant(payload));

    // ✅ close only if success
    if (createRestaurant.fulfilled.match(result)) {
      handleCloseCreate();
      setCoordsInput("");
    }
  };

  const handleToggleVegOnly = () => {
    dispatch(toggleVegOnly());
  };

  const handleToggleNonVegOnly = () => {
    dispatch(toggleNonVegOnly());
  };

  const handleToggleTopRated = () => {
    dispatch(toggleTopRated());
  };

  const handleToggleQuickDelivery = () => {
    dispatch(toggleQuickDelivery());
  };

  const filteredRestaurants = restaurants ? restaurants.filter((restaurant) => {
    let passes = true;
    if (showVegOnly && !restaurant.isVeg) passes = false;
    if (showNonVegOnly && restaurant.isVeg) passes = false;
    if (showTopRated && (restaurant.ratings || 0) < 4) passes = false;
    if (showQuickDelivery && (restaurant.deliveryTime || 30) > 30) passes = false;
    return passes;
  }) : [];

  return (
    <>
      <CountRestaurant />
      {restaurantsLoading ? (
        <div className="row">
          {[...Array(8)].map((_, i) => (
            <SkeletonRestaurant key={i} />
          ))}
        </div>
      ) : restaurantsError ? (
        <Message variant="danger"> {restaurantsError}</Message>
      ) : (
        <>
          <section>
            {keyword ? (
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 mt-3 bg-white p-4 rounded shadow-sm">
                <h3 className="mb-3 mb-md-0 font-weight-bold">
                  Search results for: <span className="text-success">"{keyword}"</span>
                </h3>
                <Link to="/" className="btn btn-outline-secondary px-4 py-2" style={{ borderRadius: "30px", fontWeight: "600" }}>
                  <i className="fa fa-arrow-left mr-2"></i> Back to all restaurants
                </Link>
              </div>
            ) : null}

            <div className="sticky-filter-bar mb-4 p-3 bg-white shadow-sm rounded">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0 font-weight-bold text-dark">
                  Filters 
                  {(showVegOnly || showNonVegOnly || showTopRated || showQuickDelivery || activeSort) && (
                    <span className="badge badge-success ml-2 rounded-circle px-2 py-1">
                      {[showVegOnly, showNonVegOnly, showTopRated, showQuickDelivery, activeSort].filter(Boolean).length}
                    </span>
                  )}
                </h5>
                {(showVegOnly || showNonVegOnly || showTopRated || showQuickDelivery || activeSort) && (
                  <button 
                    className="btn btn-sm btn-outline-danger px-3 rounded-pill" 
                    onClick={handleClearAllFilters}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="sort pb-1">
                <button 
                  className={`sort_veg p-2 px-3 ${showVegOnly ? 'active' : ''}`} 
                  onClick={handleToggleVegOnly}
                >
                  <i className="fa fa-leaf mr-2"></i>
                  Pure Veg
                  {showVegOnly && <i className="fa fa-times ml-2 small"></i>}
                </button>

                <button 
                  className={`sort_veg p-2 px-3 ${showNonVegOnly ? 'active' : ''}`} 
                  onClick={handleToggleNonVegOnly}
                >
                  <i className="fa fa-cutlery mr-2"></i>
                  Pure Non-Veg
                  {showNonVegOnly && <i className="fa fa-times ml-2 small"></i>}
                </button>

                <button 
                  className={`sort_rev p-2 px-3 ${activeSort === 'reviews' ? 'active' : ''}`} 
                  onClick={handleSortByReviews}
                >
                  <i className="fa fa-commenting-o mr-2"></i>
                  Sort By Reviews
                  {activeSort === 'reviews' && <i className="fa fa-times ml-2 small"></i>}
                </button>

                <button 
                  className={`sort_rate p-2 px-3 ${activeSort === 'ratings' ? 'active' : ''}`} 
                  onClick={handleSortByRatings}
                >
                  <i className="fa fa-star-o mr-2"></i>
                  Sort By Ratings
                  {activeSort === 'ratings' && <i className="fa fa-times ml-2 small"></i>}
                </button>

                <button 
                  className={`sort_rate p-2 px-3 ${showTopRated ? 'active' : ''}`} 
                  onClick={handleToggleTopRated}
                >
                  <i className="fa fa-star mr-2 text-warning"></i>
                  Top Rated (4+)
                  {showTopRated && <i className="fa fa-times ml-2 small"></i>}
                </button>

                <button 
                  className={`sort_rate p-2 px-3 ${showQuickDelivery ? 'active' : ''}`} 
                  onClick={handleToggleQuickDelivery}
                >
                  <i className="fa fa-bolt mr-2 text-info"></i>
                  Quick Delivery
                  {showQuickDelivery && <i className="fa fa-times ml-2 small"></i>}
                </button>
              </div>
            </div>

            <div className="row mt-4">
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant, index) => (
                  <div
                    key={restaurant._id}
                    className="col-sm-12 col-md-6 col-lg-3 my-3 restaurant-card-animate"
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <Restaurant restaurant={restaurant} />
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="no-results-state text-center py-5 my-4">
                    <div className="no-results-emoji">🍽️</div>
                    <h3 className="mt-3 mb-2">No restaurants match your filters</h3>
                    <p className="text-muted mb-4">Try removing some filters to see more results.</p>
                    <div className="active-filters-summary mb-4">
                      {showVegOnly && <span className="filter-tag">🌿 Pure Veg</span>}
                      {showNonVegOnly && <span className="filter-tag">🍗 Pure Non-Veg</span>}
                      {showTopRated && <span className="filter-tag">⭐ Top Rated</span>}
                      {showQuickDelivery && <span className="filter-tag">⚡ Quick Delivery</span>}
                      {activeSort === 'ratings' && <span className="filter-tag">🔢 Sort: Ratings</span>}
                      {activeSort === 'reviews' && <span className="filter-tag">💬 Sort: Reviews</span>}
                    </div>
                    <button 
                      className="btn btn-success px-5 py-2" 
                      style={{ borderRadius: '30px', fontWeight: 600 }}
                      onClick={handleClearAllFilters}
                    >
                      ✕ Clear All Filters
                    </button>
                  </div>
                </div>
              )}

              {/* admin add restaurant button */}
              {isAuthenticated && user && user.role === "admin" && (
                <div className="col-sm-12 col-md-6 col-lg-3 my-3">
                  <div
                    className="card p-3 rounded text-center d-flex align-items-center justify-content-center"
                    style={{ cursor: "pointer" }}
                    onClick={handleOpenCreate}
                  >
                    <h1 className="m-0">+</h1>
                    <p className="mb-0">Add Restaurant</p>
                  </div>
                </div>
              )}
            </div>

            {/* create form modal */}
            {showCreate && (
              <div className="create-modal">
                <div className="create-content">
                  <h3>Create Restaurant</h3>

                  <form onSubmit={submitCreate}>
                    {createError && (
                      <Message variant="danger">{createError}</Message>
                    )}

                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newRestaurant.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={newRestaurant.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Pure Veg</label>
                      <input
                        type="checkbox"
                        name="isVeg"
                        checked={newRestaurant.isVeg}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Coordinates (lat,lng)</label>
                      <input
                        type="text"
                        name="coordinates"
                        value={coordsInput}
                        onChange={handleChange}
                        placeholder="e.g. 40.77,-73.97"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="text"
                        name="imageUrl"
                        value={newRestaurant.imageUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        required
                      />
                    </div>

                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={creating}
                    >
                      {creating ? "Creating..." : "Create"}
                    </button>

                    <button
                      className="btn btn-secondary ml-2"
                      type="button"
                      onClick={handleCloseCreate}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
};

export default Home;