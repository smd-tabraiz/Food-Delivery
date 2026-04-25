import React from "react";

const SkeletonRestaurant = () => {
  return (
    <div className="col-sm-12 col-md-6 col-lg-3 my-3">
      <div className="card p-3 rounded skeleton-card">
        <div className="skeleton skeleton-img mb-3"></div>
        <div className="card-body d-flex flex-column p-0">
          <div className="skeleton skeleton-text skeleton-title mb-2"></div>
          <div className="skeleton skeleton-text skeleton-address mb-3"></div>
          
          <div className="ratings mt-auto">
            <div className="rating-outer skeleton-rating mb-1">
              <div className="rating-inner"></div>
            </div>
            <div className="skeleton skeleton-text skeleton-reviews mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonRestaurant;
