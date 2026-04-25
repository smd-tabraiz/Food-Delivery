const express = require("express");
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
} = require("../controllers/orderController");

const authController = require("../controllers/authController");

router.route("/new").post(authController.protect, newOrder);

router.route("/:id").get(authController.protect, getSingleOrder);
router.route("/me/myOrders").get(authController.protect, myOrders);

// Admin Routes
router
  .route("/admin/all")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    allOrders
  );

router
  .route("/admin/:id")
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    updateOrder
  );

module.exports = router;
