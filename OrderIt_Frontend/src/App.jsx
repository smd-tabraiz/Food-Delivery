import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/layout/Header";
import Home from "./components/Home.jsx";
import Menu from "./components/Menu.jsx";
import Cart from "./components/cart/Cart.jsx";
import Login from "./components/user/Login.jsx";
import Register from "./components/user/Register.jsx";
import Profile from "./components/user/Profile.jsx";
import UpdateProfile from "./components/user/UpdateProfile.jsx";
import ForgotPassword from "./components/user/ForgotPassword.jsx";
import NewPassword from "./components/user/NewPassword.jsx";
import ListOrders from "./components/order/ListOrders.jsx";
import OrderDetails from "./components/order/OrderDetails.jsx";
import OrderSuccess from "./components/cart/OrderSuccess.jsx";
import PaymentGateway from "./components/cart/PaymentGateway.jsx";
import Tracking from "./components/order/Tracking.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import { useDispatch } from "react-redux";
import { loadUser } from "./redux/actions/userActions";
import { getOrderDetails, myOrders } from "./redux/actions/orderActions";
import { updateOrderFromSocket } from "./redux/slices/orderSlice";
import { io } from "socket.io-client";

import "./App.css";
import "./modernUI.css";

const ConditionalHeader = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Show header on home (/) and restaurant/search pages
  const showHeader = path === "/" || path.startsWith("/eats/stores/") || path.startsWith("/admin") || path.startsWith("/eats/orders") || path.startsWith("/cart") || path.startsWith("/order");

  if (!showHeader) return null;
  return <Header />;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
    
    // Setup Socket for Real-Time Updates
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    const socket = io(backendUrl);

    socket.on("orderStatusUpdated", (data) => {
      console.log("Real-time update received:", data);
      
      // Notify the user
      toast.info(data.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Instantly update the Redux state without a refresh
      dispatch(updateOrderFromSocket({ 
        orderId: data.orderId, 
        status: data.status 
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <ConditionalHeader />
        <div className="container container-fluid">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/eats/stores/search/:keyword" element={<Home />} />
            <Route path="/eats/stores/:id/menus" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            
            <Route path="/users/login" element={<Login />} />
            <Route path="/users/signup" element={<Register />} />
            <Route path="/users/me" element={<Profile />} />
            <Route path="/users/me/update" element={<UpdateProfile />} />
            <Route path="/users/forgetPassword" element={<ForgotPassword />} />
            <Route path="/users/resetPassword/:token" element={<NewPassword />} />
            
            <Route path="/eats/orders/me/myOrders" element={<ListOrders />} />
            <Route path="/eats/orders/:id" element={<OrderDetails />} />
            <Route path="/eats/orders/success" element={<OrderSuccess />} />
            <Route path="/payment" element={<PaymentGateway />} />
            <Route path="/order/tracking" element={<Tracking />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
      <ToastContainer position="top-right" theme="colored" />
    </Router>
  );
}

export default App;
