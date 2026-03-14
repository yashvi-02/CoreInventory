import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Package, Truck, ArrowLeftRight, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

const Operations = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    pendingReceipts: 0,
    pendingDeliveries: 0,
    pendingTransfers: 0,
    lowStockItems: 0,
    totalProducts: 0,
    totalWarehouses: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchOperationsData();
  }, []);

  const fetchOperationsData = async () => {
    try {
      setIsLoading(true);
      const [dashboardRes, receiptsRes, deliveriesRes, transfersRes, productsRes, warehousesRes] = await Promise.all([
        api.get('/dashboard').catch(() => ({ data: {} })),
        api.get('/receipts').catch(() => ({ data: [] })),
        api.get('/deliveries').catch(() => ({ data: [] })),
        api.get('/transfers').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/warehouses').catch(() => ({ data: [] }))
      ]);

      const dashboard = dashboardRes.data || {};
      const receipts = Array.isArray(receiptsRes.data) ? receiptsRes.data : [];
      const deliveries = Array.isArray(deliveriesRes.data) ? deliveriesRes.data : [];
      const transfers = Array.isArray(transfersRes.data) ? transfersRes.data : [];
      const products = Array.isArray(productsRes.data) ? productsRes.data : [];
      const warehouses = Array.isArray(warehousesRes.data) ? warehousesRes.data : [];

      setMetrics({
        pendingReceipts: dashboard.pendingReceipts || receipts.filter(r => r.status === 'draft' || r.status === 'waiting').length,
        pendingDeliveries: dashboard.pendingDeliveries || deliveries.filter(d => d.status === 'draft' || d.status === 'ready').length,
        pendingTransfers: dashboard.internalTransfers || transfers.filter(t => t.status === 'draft').length,
        lowStockItems: dashboard.lowStock || 0,
        totalProducts: products.length,
        totalWarehouses: warehouses.length
      });

      // Build recent activities from various sources
      const activities = [];
      receipts.slice(0, 3).forEach(r => {
        activities.push({
          id: `r-${r.id}`,
          type: 'receipt',
          title: `Receipt ${r.reference || `#${r.id}`}`,
          status: r.status,
          time: r.created_at || new Date().toISOString()
        });
      });
      deliveries.slice(0, 3).forEach(d => {
        activities.push({
          id: `d-${d.id}`,
          type: 'delivery',
          title: `Delivery to ${d.customer || `#${d.id}`}`,
          status: d.status,
          time: d.created_at || new Date().toISOString()
        });
      });
      transfers.slice(0, 2).forEach(t => {
        activities.push({
          id: `t-${t.id}`,
          type: 'transfer',
          title: `Transfer ${t.reference || `#${t.id}`}`,
          status: t.status,
          time: t.created_at || new Date().toISOString()
        });
      });

      setRecentActivities(activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch operations data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const operationCards = [
    {
      title: 'Pending Receipts',
      value: metrics.pendingReceipts,
      icon: <Package size={24} />,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      border: 'border-blue-200',
      href: '/receipts'
    },
    {
      title: 'Pending Deliveries',
      value: metrics.pendingDeliveries,
      icon: <Truck size={24} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      border: 'border-emerald-200',
      href: '/delivery'
    },
    {
      title: 'Pending Transfers',
      value: metrics.pendingTransfers,
      icon: <ArrowLeftRight size={24} />,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      border: 'border-purple-200',
      href: '/transfers'
    },
    {
      title: 'Low Stock Alerts',
      value: metrics.lowStockItems,
      icon: <AlertTriangle size={24} />,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
      border: 'border-rose-200',
      href: '/products'
    }
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', label: 'Draft' },
      ready: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Ready' },
      waiting: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Waiting' },
      done: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Done' },
      completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Completed' }
    };
    const s = statusMap[status] || statusMap.draft;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}>
        {s.label}
      </span>
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'receipt': return <Package size={16} className="text-blue-600" />;
      case 'delivery': return <Truck size={16} className="text-emerald-600" />;
      case 'transfer': return <ArrowLeftRight size={16} className="text-purple-600" />;
      default: return <Activity size={16} className="text-slate-600" />;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Just now';
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="text-blue-600" /> Operations Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">Monitor and manage all operational activities.</p>
        </div>
        <button
          onClick={fetchOperationsData}
          className="self-start sm:self-auto bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {operationCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-6 shadow-sm border ${card.border} hover:shadow-md transition-all cursor-pointer group`}
            onClick={() => navigate(card.href)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
                  {isLoading ? '...' : card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={14} className="text-slate-400" />
              <span className="text-slate-400">Click to view details</span>
            </div>
          </div>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Total Products</span>
              <span className="font-bold text-slate-800">{isLoading ? '...' : metrics.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Total Warehouses</span>
              <span className="font-bold text-slate-800">{isLoading ? '...' : metrics.totalWarehouses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Pending Operations</span>
              <span className="font-bold text-amber-600">
                {isLoading ? '...' : metrics.pendingReceipts + metrics.pendingDeliveries + metrics.pendingTransfers}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activities</h2>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">
              <Clock size={32} className="mx-auto mb-2 animate-spin" />
              <p>Loading activities...</p>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Activity size={32} className="mx-auto mb-2 text-slate-300" />
              <p>No recent activities</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(activity.status)}
                      <span className="text-xs text-slate-500">{formatTime(activity.time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/receipts')}
            className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-left"
          >
            <Package size={20} className="text-blue-600" />
            <span className="font-medium text-slate-800">New Receipt</span>
          </button>
          <button
            onClick={() => navigate('/delivery')}
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors text-left"
          >
            <Truck size={20} className="text-emerald-600" />
            <span className="font-medium text-slate-800">New Delivery</span>
          </button>
          <button
            onClick={() => navigate('/transfers')}
            className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors text-left"
          >
            <ArrowLeftRight size={20} className="text-purple-600" />
            <span className="font-medium text-slate-800">New Transfer</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors text-left"
          >
            <TrendingUp size={20} className="text-amber-600" />
            <span className="font-medium text-slate-800">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Operations;
