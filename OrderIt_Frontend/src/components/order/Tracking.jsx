import React, { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import BackButton from "../layout/BackButton";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const Tracking = () => {
  const location = useLocation();
  const state = location.state || {};
  const restaurantName = state.restaurantName || "Restaurant";
  const orderId = state.orderId; // Get orderId from state if passed
  
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [dynamicRestLocation, setDynamicRestLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [orderStatus, setOrderStatus] = useState("Restaurant accepted the order.");
  const [deliveryPartner, setDeliveryPartner] = useState("Assigning a delivery partner...");

  useEffect(() => {
    // Initial simulation
    const timer1 = setTimeout(() => {
      setDeliveryPartner("Ramesh is arriving to pick up your order.");
    }, 5000);
    
    // Setup Socket for Real-Time Updates
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    const socket = io(backendUrl);
    
    socket.on("orderStatusUpdated", (data) => {
      // If no orderId is passed to tracking, or if it matches the current update
      if (!orderId || data.orderId === orderId) {
        setOrderStatus(data.status);
        if (data.status === "Shipped") setDeliveryPartner("Ramesh has picked up your order!");
        if (data.status === "Out for Delivery") setDeliveryPartner("Ramesh is nearby!");
        if (data.status === "Delivered") setDeliveryPartner("Enjoy your meal!");
      }
    });

    return () => {
      clearTimeout(timer1);
      socket.disconnect();
    };
  }, [orderId]);

  useEffect(() => {
    // If we already have the GPS location from the Payment Gateway, use it
    if (state.userLocation) {
      setUserLocation(state.userLocation);
      return;
    }

    // Otherwise fetch user GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast.error("Could not get your location for tracking. Using default Delhi location.");
          setUserLocation([28.6139, 77.2090]); // Default to Delhi
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setUserLocation([28.6139, 77.2090]); 
    }
  }, [state.userLocation]);

  useEffect(() => {
    // Generate a random restaurant location within a 5km radius of the user
    if (userLocation && !dynamicRestLocation) {
      const radiusInKm = 5; 
      const r = radiusInKm / 111.3; // roughly 111.3 km per degree
      
      const w = r * Math.sqrt(Math.random());
      const t = 2 * Math.PI * Math.random();
      
      const x = w * Math.cos(t);
      const y = w * Math.sin(t);
      
      const adjustedX = x / Math.cos(userLocation[0] * (Math.PI / 180));
      
      const restLat = userLocation[0] + y;
      const restLng = userLocation[1] + adjustedX;
      
      setDynamicRestLocation([restLat, restLng]);
    }
  }, [userLocation, dynamicRestLocation]);

  useEffect(() => {
    if (userLocation && dynamicRestLocation) {
      const restLat = dynamicRestLocation[0];
      const restLng = dynamicRestLocation[1];
      const restLocation = [restLat, restLng];

      // Calculate distance using Haversine formula
      const R = 6371; // Radius of the Earth in km
      const dLat = (restLat - userLocation[0]) * (Math.PI / 180);
      const dLng = (restLng - userLocation[1]) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLocation[0] * (Math.PI / 180)) * Math.cos(restLat * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c; // Distance in km
      setDistance(dist.toFixed(2));
      
      // Calculate ETA (assume average speed of 30 km/h + 15 mins prep time)
      const timeInHours = dist / 30;
      const timeInMins = Math.round(timeInHours * 60) + 15;
      setEta(timeInMins);

      // Initialize Map if not already initialized
      if (!mapRef.current) {
        const L = window.L;
        if (L) {
          const map = L.map("tracking-map").setView(userLocation, 13);
          mapRef.current = map;

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          // User Marker (Home)
          const userIcon = L.divIcon({
            html: '<i class="fa fa-home fa-2x text-primary"></i>',
            className: 'custom-leaflet-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          });
          L.marker(userLocation, { icon: userIcon }).addTo(map).bindPopup("Your Location").openPopup();

          // Restaurant Marker
          const restIcon = L.divIcon({
            html: '<i class="fa fa-cutlery fa-2x text-danger"></i>',
            className: 'custom-leaflet-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          });
          L.marker(restLocation, { icon: restIcon }).addTo(map).bindPopup(restaurantName || "Restaurant");

          // Draw Polyline
          const latlngs = [userLocation, restLocation];
          L.polyline(latlngs, { color: '#056a3a', weight: 4, dashArray: '10, 10' }).addTo(map);

          // Fit bounds
          map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
        }
      }
    }
  }, [userLocation, dynamicRestLocation, restaurantName]);

  return (
    <div className="container tracking-container mt-4 mb-5">
      <BackButton to="/" label="Back to Home" />
      
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm border-0 rounded-lg p-4 h-100">
            <h3 className="mb-4 text-center" style={{ color: "#056a3a", fontWeight: "bold" }}>
              Order Tracking
            </h3>
            
            <div className="tracking-status mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-circle bg-success text-white p-3 rounded-circle mr-3 shadow-sm">
                  <i className="fa fa-check"></i>
                </div>
                <div>
                  <h6 className="mb-0 font-weight-bold">Order Confirmed</h6>
                  <small className="text-muted">{orderStatus}</small>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="icon-circle bg-info text-white p-3 rounded-circle mr-3 shadow-sm">
                  <i className="fa fa-motorcycle"></i>
                </div>
                <div>
                  <h6 className="mb-0 font-weight-bold">Delivery Partner</h6>
                  <small className="text-muted">{deliveryPartner}</small>
                </div>
              </div>
            </div>

            <div className="tracking-details bg-light p-3 rounded">
              <p className="mb-2"><strong>Restaurant:</strong> {restaurantName || "Loading..."}</p>
              <p className="mb-2"><strong>Distance:</strong> {distance ? `${distance} km` : "Calculating..."}</p>
              <p className="mb-0"><strong>Estimated Arrival:</strong> {eta ? `${eta} mins` : "Calculating..."}</p>
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/eats/orders/me/myOrders" className="btn btn-primary btn-block rounded-pill">
                View My Orders
              </Link>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-lg overflow-hidden h-100" style={{ minHeight: "450px" }}>
            <div id="tracking-map" style={{ width: "100%", height: "100%", minHeight: "450px" }}></div>
            {!userLocation && (
              <div className="d-flex justify-content-center align-items-center" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.8)", zIndex: 1000 }}>
                <div className="text-center">
                  <div className="spinner-border text-success mb-2" role="status"></div>
                  <h5>Finding your location...</h5>
                  <p className="text-muted small">Please allow location access if prompted.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
