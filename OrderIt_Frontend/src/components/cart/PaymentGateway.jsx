import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "../layout/BackButton";

const PaymentGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalAmount, restaurantName, itemCount, restaurantId, restaurantCoords } = location.state || {};

  const [step, setStep] = useState("form"); // form | processing | success
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const [userLocation, setUserLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(true);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setFetchingLocation(false);
        },
        (error) => {
          console.error("Error fetching GPS", error);
          setFetchingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setFetchingLocation(false);
    }
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Auto-format card number with spaces
    if (name === "number") {
      value = value.replace(/\D/g, "").slice(0, 16);
      value = value.replace(/(.{4})/g, "$1 ").trim();
    }

    // Auto-format expiry MM/YY
    if (name === "expiry") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    }

    // CVV max 3 digits
    if (name === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 3);
    }

    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePay = (e) => {
    e.preventDefault();
    setStep("processing");

    // Simulate a 2.5s payment processing delay
    setTimeout(() => {
      setStep("success");

      setTimeout(() => {
        navigate("/eats/orders/success?session_id=dummy_session_" + Date.now(), {
          state: {
            restaurantName,
            restaurantCoords,
            totalAmount,
            userLocation, // Pass the fetched GPS coords
          },
        });
      }, 2500);
    }, 2500);
  };

  if (fetchingLocation) {
    return (
      <div className="payment-overlay">
        <div className="payment-processing-card">
          <div className="payment-spinner"></div>
          <h3>Detecting Location...</h3>
          <p>Please allow location access to continue with checkout.</p>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="payment-overlay">
        <div className="payment-processing-card">
          <div className="payment-spinner"></div>
          <h3>Processing Payment...</h3>
          <p>Please do not close or refresh this page.</p>
          <p className="payment-amount">₹{totalAmount?.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="payment-overlay">
        <div className="payment-processing-card">
          <div className="payment-success-icon">
            <i className="fa fa-check-circle"></i>
          </div>
          <h2>Payment Successful!</h2>
          <p>Your order has been placed successfully 🎉</p>
          <p className="payment-amount">₹{totalAmount?.toFixed(2)} paid</p>
          <p className="text-muted small">Redirecting to your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page-wrapper">
      <BackButton to="/cart" label="Back to Cart" />

      <div className="payment-container">
        {/* Left: Order Summary */}
        <div className="payment-summary-panel">
          <div className="payment-brand">
            <i className="fa fa-lock mr-2"></i> Secure Payment
          </div>
          <h3>Order Summary</h3>
          <div className="payment-summary-item">
            <span>Restaurant</span>
            <strong>{restaurantName || "—"}</strong>
          </div>
          <div className="payment-summary-item">
            <span>Items</span>
            <strong>{itemCount || "—"}</strong>
          </div>
          <div className="payment-summary-item total-row">
            <span>Total Amount</span>
            <strong>₹{totalAmount?.toFixed(2) || "0.00"}</strong>
          </div>

          <div className="payment-badges">
            <span><i className="fa fa-shield mr-1"></i> SSL Secured</span>
            <span><i className="fa fa-lock mr-1"></i> 256-bit Encryption</span>
          </div>
        </div>

        {/* Right: Payment Form */}
        <div className="payment-form-panel">
          <h3>Choose Payment Method</h3>

          {/* Method Tabs */}
          <div className="payment-method-tabs">
            {["card", "upi", "netbanking"].map((method) => (
              <button
                key={method}
                type="button"
                className={`payment-method-tab ${paymentMethod === method ? "active" : ""}`}
                onClick={() => setPaymentMethod(method)}
              >
                {method === "card" && <><i className="fa fa-credit-card mr-2"></i>Card</>}
                {method === "upi" && <><i className="fa fa-mobile mr-2"></i>UPI</>}
                {method === "netbanking" && <><i className="fa fa-university mr-2"></i>Net Banking</>}
              </button>
            ))}
          </div>

          <form onSubmit={handlePay} className="payment-form">
            {paymentMethod === "card" && (
              <>
                <div className="payment-field">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="payment-field">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="number"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="payment-field-row">
                  <div className="payment-field">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="payment-field">
                    <label>CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      placeholder="•••"
                      value={cardDetails.cvv}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <p className="payment-hint">
                  <i className="fa fa-info-circle mr-1"></i>
                  Use any details — this is a demo payment.
                </p>
              </>
            )}

            {paymentMethod === "upi" && (
              <div className="payment-field">
                <label>UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  required
                />
                <p className="payment-hint">
                  <i className="fa fa-info-circle mr-1"></i>
                  Any UPI ID works — this is a demo payment.
                </p>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div className="payment-field">
                <label>Select Bank</label>
                <select required>
                  <option value="">Select your bank</option>
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
                <p className="payment-hint">
                  <i className="fa fa-info-circle mr-1"></i>
                  Demo only — no real transaction will occur.
                </p>
              </div>
            )}

            <button type="submit" className="payment-pay-btn">
              <i className="fa fa-lock mr-2"></i>
              Pay ₹{totalAmount?.toFixed(2) || "0.00"} Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
