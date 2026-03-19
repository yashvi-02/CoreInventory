import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
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
import Adjustments from './pages/Adjustments';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Main Application Routes inside Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="operations" element={<Operations />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="delivery" element={<DeliveryOrders />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="adjustments" element={<Adjustments />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="ledger" element={<StockLedger />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
