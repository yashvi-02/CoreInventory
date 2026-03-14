import React from "react";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="logo">
        CoreInventory
      </div>

      <ul className="sidebar-menu">

        <li>Dashboard</li>

        <li>Products</li>

        <li>Receipts</li>

        <li>Delivery Orders</li>

        <li>Transfers</li>

        <li>Inventory Adjustments</li>

        <li>Warehouses</li>

        <li>Stock Ledger</li>

        <li>Reports</li>

        <li>Settings</li>

      </ul>

    </div>
  );
}

export default Sidebar;