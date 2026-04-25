import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../redux/actions/userActions";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";
import Search from "./Search";
import "../../App.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Updated slice
  const { user, loading } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart?.cartItems) || [];

  const logoutHandler = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <>
      <nav className="navbar navbar-expand-md row sticky-top">
        {/* logo */}
        <div className="col-8 col-md-3 logo-container">
          <Link to="/">
            <img 
              src="/images/logo.png" 
              alt="logo" 
              className="logo" 
              style={{ height: "100px", width: "auto", objectFit: "contain" }} 
            />
          </Link>
        </div>

        {/* hamburger menu button */}
        <div className="col-4 d-md-none text-right mt-3">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="fa fa-bars text-dark"></span>
          </button>
        </div>

        {/* collapsible content */}
        <div className="collapse navbar-collapse col-12 col-md-9" id="navbarContent">
          <div className="row w-100 align-items-center">
            {/* search */}
            <div className="col-12 col-md-8 mt-2 mt-md-0">
              <Search />
            </div>

            {/* right side */}
            <div className="col-12 col-md-4 mt-4 mt-md-0 text-center text-md-right d-flex align-items-center justify-content-end">
              {/* Dark Mode Toggle */}
              <button
                className="dark-mode-toggle mr-3"
                onClick={toggleDarkMode}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <i className={`fa ${darkMode ? "fa-sun-o" : "fa-moon-o"}`}></i>
              </button>

              <Link to="/cart" style={{ textDecoration: "none" }} className="cart-link">
                <span id="cart" className="ml-3">
                  <i className="fa fa-shopping-basket mr-1" aria-hidden="true" aria-label="Shopping Cart"></i>
                  Cart
                </span>
                <span className="ml-1" id="cart_count">
                  {cartItems?.reduce((acc, item) => acc + Number(item.quantity), 0) ?? 0}
                </span>
              </Link>

              {user ? (
                <div className="ml-4 dropdown d-inline">
                  <button
                    className="btn dropdown-toggle text-white mr-4 border-0 bg-transparent"
                    id="dropDownMenuButton"
                    type="button"
                    onClick={toggleDropdown}
                    aria-expanded={isDropdownOpen}
                  >
                    <figure className="avatar avatar-nav">
                      {user?.avatar?.url ? (
                        <img
                          src={user.avatar.url}
                          alt={user.name}
                          className="rounded-circle"
                        />
                      ) : (
                        <i className="fa fa-user-circle header-avatar-icon"></i>
                      )}
                    </figure>

                    <span>{user?.name} <i className="fa fa-user header-user-icon" aria-hidden="true"></i></span>
                  </button>

                  <div 
                    className={`custom-dropdown-menu ${isDropdownOpen ? "open" : ""}`} 
                  >
                    <Link className="custom-dropdown-item" to="/users/me" onClick={() => setIsDropdownOpen(false)}>
                      <i className="fa fa-user-circle-o mr-2"></i> Profile
                    </Link>

                    <Link className="custom-dropdown-item" to="/eats/orders/me/myOrders" onClick={() => setIsDropdownOpen(false)}>
                      <i className="fa fa-list mr-2"></i> My Orders
                    </Link>

                    {user?.role === "admin" && (
                      <Link className="custom-dropdown-item text-warning" to="/admin/dashboard" onClick={() => setIsDropdownOpen(false)}>
                        <i className="fa fa-bar-chart mr-2"></i> Admin Dashboard
                      </Link>
                    )}

                    <Link className="custom-dropdown-item" to="/users/me/update" onClick={() => setIsDropdownOpen(false)}>
                      <i className="fa fa-cog mr-2"></i> Settings
                    </Link>

                    <div className="custom-dropdown-divider"></div>

                    <button
                      className="custom-dropdown-item text-danger w-100 text-left border-0 bg-transparent"
                      onClick={() => {
                        logoutHandler();
                        setIsDropdownOpen(false);
                      }}
                    >
                      <i className="fa fa-sign-out mr-2"></i> Logout
                    </button>
                  </div>
                </div>
              ) : loading ? (
                <div className="spinner-border text-primary ml-4" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <Link to="/users/login" className="btn ml-4" id="login_btn">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;