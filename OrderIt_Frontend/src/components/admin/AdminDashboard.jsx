import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../../redux/actions/orderActions";
import { toast } from "react-toastify";
import BackButton from "../layout/BackButton";
import { clearErrors } from "../../redux/slices/orderSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, orders = [] } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);

  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    dispatch(getAllOrders());
  }, [dispatch, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "bottom-right" });
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    await dispatch(updateOrderStatus({ id, status }));
    dispatch(getAllOrders()); // refresh
    setUpdatingId(null);
    toast.success("Order status updated!");
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((acc, o) => acc + (o.finalTotal || 0), 0);
  const totalOrders = orders.length;
  const delivered = orders.filter((o) => o.orderStatus?.includes("Delivered")).length;
  const processing = orders.filter((o) => !o.orderStatus?.includes("Delivered")).length;

  // ── Unique food items sold ────────────────────────────────────────────────
  const itemCounts = {};
  orders.forEach((order) => {
    (order.orderItems || []).forEach((item) => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCount = topItems[0]?.[1] || 1;

  return (
    <div className="admin-dashboard container-fluid py-4 px-4">
      <BackButton to="/" label="Back to Home" />
      <h2 className="admin-title mb-4">📊 Admin Dashboard</h2>

      {/* ── Stat Cards ── */}
      <div className="row mb-4">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toFixed(0)}`, icon: "fa-rupee", color: "#056a3a" },
          { label: "Total Orders", value: totalOrders, icon: "fa-shopping-bag", color: "#0a7fd4" },
          { label: "Delivered", value: delivered, icon: "fa-check-circle", color: "#28a745" },
          { label: "Processing", value: processing, icon: "fa-clock-o", color: "#fd7e14" },
        ].map((stat) => (
          <div key={stat.label} className="col-6 col-md-3 mb-3">
            <div className="admin-stat-card" style={{ borderLeft: `5px solid ${stat.color}` }}>
              <i className={`fa ${stat.icon} admin-stat-icon`} style={{ color: stat.color }}></i>
              <div>
                <div className="admin-stat-value">{stat.value}</div>
                <div className="admin-stat-label">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mb-4">
        {/* ── Top Food Items Chart ── */}
        <div className="col-12 col-lg-5 mb-4">
          <div className="admin-card">
            <h5 className="admin-card-title">🍕 Top 5 Selling Items</h5>
            {topItems.length === 0 ? (
              <p className="text-muted">No data yet.</p>
            ) : (
              topItems.map(([name, count]) => (
                <div key={name} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="font-weight-bold" style={{ fontSize: "0.9rem" }}>{name}</span>
                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>{count} sold</span>
                  </div>
                  <div className="admin-bar-bg">
                    <div
                      className="admin-bar-fill"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Order Status Breakdown ── */}
        <div className="col-12 col-lg-7 mb-4">
          <div className="admin-card">
            <h5 className="admin-card-title">📦 Order Status Breakdown</h5>
            <div className="d-flex gap-3 mb-3" style={{ gap: "15px" }}>
              {[
                { label: "Delivered", count: delivered, color: "#28a745" },
                { label: "Processing", count: processing, color: "#fd7e14" },
              ].map((s) => (
                <div key={s.label} className="admin-donut-stat">
                  <div className="admin-donut-circle" style={{ borderColor: s.color }}>
                    <span style={{ color: s.color }}>{s.count}</span>
                  </div>
                  <p className="admin-donut-label">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="admin-card mb-4">
        <h5 className="admin-card-title">🗂️ Manage Orders</h5>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success" role="status"></div>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-muted text-center py-3">No orders found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="text-monospace" style={{ fontSize: "0.78rem" }}>
                      {order._id?.slice(-8)}
                    </td>
                    <td>{order.user?.name || "N/A"}</td>
                    <td>{order.orderItems?.length || 0}</td>
                    <td>₹{order.finalTotal}</td>
                    <td>
                      <span className={`badge ${order.orderStatus?.includes("Delivered") ? "badge-success" : "badge-warning"}`}>
                        {order.orderStatus || "Processing"}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-control form-control-sm admin-status-select"
                        value={order.orderStatus || "Processing"}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
