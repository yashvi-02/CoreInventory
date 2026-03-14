import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';

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
          <Route path="receipts" element={<div className="p-6">Receipts Page</div>} />
          <Route path="delivery" element={<div className="p-6">Delivery Orders Page</div>} />
          <Route path="transfers" element={<div className="p-6">Transfers Page</div>} />
          <Route path="adjustments" element={<div className="p-6">Inventory Adjustments Page</div>} />
          <Route path="warehouses" element={<div className="p-6">Warehouses Page</div>} />
          <Route path="ledger" element={<div className="p-6">Stock Ledger Page</div>} />
          <Route path="reports" element={<div className="p-6">Reports Page</div>} />
          <Route path="settings" element={<div className="p-6">Settings Page</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
