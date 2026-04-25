const Order = require("../models/order");
const FoodItem = require("../models/foodItem");
const Cart = require("../models/cartModel");
const { ObjectId } = require("mongodb");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const dotenv = require("dotenv");

//setting up config file FIRST before using any env vars
dotenv.config({ path: "./config/config.env" });

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a new order   =>  /api/v1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  // console.log("id", req.body);
  const { session_id } = req.body;
  let order;

  // Handle dummy session (bypass Stripe)
  if (session_id && session_id.startsWith("dummy_session_")) {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({ path: "items.foodItem", select: "name price images stock" })
      .populate({ path: "restaurant", select: "name" });

    if (!cart) return next(new ErrorHandler("Cart not found", 404));

    let orderItems = cart.items.map((item) => ({
      name: item.foodItem.name,
      quantity: item.quantity,
      image: item.foodItem.images?.[0]?.url || "",
      price: item.foodItem.price,
      fooditem: item.foodItem._id,
    }));

    const finalTotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    order = await Order.create({
      orderItems,
      deliveryInfo: {
        address: "Dummy Address, India",
        city: "Dummy City",
        phoneNo: "9999999999",
        postalCode: "110001",
        country: "IN",
      },
      paymentInfo: {
        id: session_id,
        status: "paid",
      },
      deliveryCharge: 0,
      itemsPrice: finalTotal,
      finalTotal: finalTotal,
      user: req.user.id,
      restaurant: cart.restaurant._id,
      paidAt: Date.now(),
    });

    await Cart.findOneAndDelete({ user: req.user._id });
  } else {
    // Original Stripe flow
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer"],
    });
    
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items.foodItem",
        select: "name price images",
      })
      .populate({
        path: "restaurant",
        select: "name",
      });

    let deliveryInfo = {
      address:
        session.shipping_details.address.line1 +
        " " +
        session.shipping_details.address.line1,
      city: session.shipping_details.address.city,
      phoneNo: session.customer_details.phone,
      postalCode: session.shipping_details.address.postal_code,
      country: session.shipping_details.address.country,
    };
    let orderItems = cart.items.map((item) => ({
      name: item.foodItem.name,
      quantity: item.quantity,
      image: item.foodItem.images[0].url,
      price: item.foodItem.price,
      fooditem: item.foodItem._id,
    }));

    let paymentInfo = {
      id: session.payment_intent,
      status: session.payment_status,
    };

    order = await Order.create({
      orderItems,
      deliveryInfo,
      paymentInfo,
      deliveryCharge: +session.shipping_cost.amount_subtotal / 100,
      itemsPrice: +session.amount_subtotal / 100,
      finalTotal: +session.amount_total / 100,
      user: req.user.id,
      restaurant: cart.restaurant._id,
      paidAt: Date.now(),
    });

    await Cart.findOneAndDelete({ user: req.user._id });
  }

  // Send Confirmation Email via SendGrid
  const msg = {
    to: req.user.email,
    from: 'smdtabraiz@gmail.com',
    subject: 'Order Confirmation - OrderIt',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #056a3a;">Thank you for your order!</h2>
        <p>Hi ${req.user.name},</p>
        <p>Your order <strong>#${order._id}</strong> has been successfully placed.</p>
        <p><strong>Total Amount:</strong> ₹${order.finalTotal}</p>
        <p>We are processing your order and will notify you once it is on the way.</p>
        <br>
        <p>Enjoy your meal,</p>
        <p><strong>The OrderIt Team</strong></p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Order confirmation email sent to:', req.user.email);
  } catch (err) {
    console.error('Failed to send order confirmation email:', err.response ? err.response.body : err);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get single order   =>   /api/v1/orders/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("restaurant")
    .exec();

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get logged in user orders   =>   /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  // Get the user ID from req.user
  const userId = new ObjectId(req.user.id);
  // Find orders for the specific user using the retrieved user ID
  const orders = await Order.find({ user: userId })
    .populate("user", "name email")
    .populate("restaurant")
    .exec();

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get all orders - ADMIN  =>   /api/v1/admin/orders/
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.finalTotal;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// Update / Process order - ADMIN  =>   /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  order.orderStatus = req.body.orderStatus;
  
  if (req.body.orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  // Real-time update via Socket.io
  if (global.io) {
    global.io.emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.orderStatus,
      message: `Order #${order._id.toString().slice(-6)} is now ${order.orderStatus}`
    });
  }

  res.status(200).json({
    success: true,
  });
});
