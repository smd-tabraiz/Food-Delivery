import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DataTableModule from "react-data-table-component";
import BackButton from "../layout/BackButton";

const DataTable = DataTableModule.default || DataTableModule;

import Loader from "../layout/Loader";

import { getRestaurants } from "../../redux/actions/restaurantAction";
import { myOrders } from "../../redux/actions/orderActions";
import { clearErrors } from "../../redux/slices/orderSlice";

import "./ListOrders.css";

const ListOrders = () => {
  const dispatch = useDispatch();

  const { loading, error, orders } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(myOrders());
    dispatch(getRestaurants());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "bottom-right" });
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  // Columns
  const columns = [
    {
      name: "Restaurant",
      selector: (row) => row.restaurant,
      sortable: true,
    },
    {
      name: "Items",
      selector: (row) => row.items,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={
            row.status.includes("Delivered")
              ? "status-delivered"
              : "status-pending"
          }
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <Link to={`/eats/orders/${row.id}`} className="btn btn-primary btn-sm">
          View
        </Link>
      ),
    },
  ];

  // Data
  const data =
    orders?.map((order) => ({
      id: order._id,
      restaurant: order.restaurant?.name || "Unknown",
      items: order.orderItems?.length || 0,
      amount: `₹${order.finalTotal || 0}`,
      status: order.orderStatus || "Processing",
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-",
    })) || [];

  return (
    <div className="list-orders-container">
      <BackButton to="/" label="Back to Home" />
      <h1 className="orders-title">My Orders</h1>

      {loading ? (
        <Loader />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pagination
          highlightOnHover
          striped
          responsive
          customStyles={customStyles}
        />
      )}
    </div>
  );
};

// ✅ Custom styling
const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
      fontSize: "16px",
      backgroundColor: "#f8f9fa",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
    },
  },
};

export default ListOrders;