import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockLedger from './pages/StockLedger';
import Operations from './pages/Operations';
import DeliveryOrders from './pages/DeliveryOrders';
import Receipts from './pages/Receipts';
import Transfers from './pages/Transfers';
import Warehouses from './pages/Warehouses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Main Application Routes inside Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          
          {/* Placeholder routes for future expansion */}
          <Route path="operations" element={<Operations />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="delivery" element={<DeliveryOrders />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="adjustments" element={<div className="p-6">Inventory Adjustments Page</div>} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="ledger" element={<StockLedger />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
