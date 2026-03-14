import { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, Package, Truck, ArrowLeftRight, Calendar, Filter } from 'lucide-react';
import { api } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const [reportData, setReportData] = useState({
    products: [],
    receipts: [],
    deliveries: [],
    transfers: [],
    adjustments: [],
    ledger: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d, all

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, receiptsRes, deliveriesRes, transfersRes, adjustmentsRes, ledgerRes] = await Promise.all([
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/receipts').catch(() => ({ data: [] })),
        api.get('/deliveries').catch(() => ({ data: [] })),
        api.get('/transfers').catch(() => ({ data: [] })),
        api.get('/adjustments').catch(() => ({ data: [] })),
        api.get('/ledger').catch(() => ({ data: [] }))
      ]);

      setReportData({
        products: Array.isArray(productsRes.data) ? productsRes.data : [],
        receipts: Array.isArray(receiptsRes.data) ? receiptsRes.data : [],
        deliveries: Array.isArray(deliveriesRes.data) ? deliveriesRes.data : [],
        transfers: Array.isArray(transfersRes.data) ? transfersRes.data : [],
        adjustments: Array.isArray(adjustmentsRes.data) ? adjustmentsRes.data : [],
        ledger: Array.isArray(ledgerRes.data) ? ledgerRes.data : []
      });
    } catch (err) {
      console.error('Failed to fetch report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateFilter = () => {
    const now = new Date();
    const filters = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      'all': new Date(0)
    };
    return filters[dateRange] || filters['7d'];
  };

  const filterByDate = (items) => {
    if (dateRange === 'all') return items;
    const cutoff = getDateFilter();
    return items.filter(item => {
      const itemDate = new Date(item.created_at || item.date || 0);
      return itemDate >= cutoff;
    });
  };

  const calculateStats = () => {
    const filteredReceipts = filterByDate(reportData.receipts);
    const filteredDeliveries = filterByDate(reportData.deliveries);
    const filteredTransfers = filterByDate(reportData.transfers);
    const filteredAdjustments = filterByDate(reportData.adjustments);

    return {
      totalReceipts: filteredReceipts.length,
      totalDeliveries: filteredDeliveries.length,
      totalTransfers: filteredTransfers.length,
      totalAdjustments: filteredAdjustments.length,
      completedReceipts: filteredReceipts.filter(r => r.status === 'done' || r.status === 'ready').length,
      completedDeliveries: filteredDeliveries.filter(d => d.status === 'done').length,
      pendingOperations: filteredReceipts.filter(r => r.status === 'draft' || r.status === 'waiting').length +
        filteredDeliveries.filter(d => d.status === 'draft' || d.status === 'ready').length
    };
  };

  const stats = calculateStats();

  const prepareTransactionChartData = () => {
    const filteredReceipts = filterByDate(reportData.receipts);
    const filteredDeliveries = filterByDate(reportData.deliveries);
    const filteredTransfers = filterByDate(reportData.transfers);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const receiptsByDay = last7Days.map(() => 0);
    const deliveriesByDay = last7Days.map(() => 0);
    const transfersByDay = last7Days.map(() => 0);

    filteredReceipts.forEach(r => {
      const date = new Date(r.created_at || r.date);
      const dayIndex = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < 7) {
        receiptsByDay[6 - dayIndex]++;
      }
    });

    filteredDeliveries.forEach(d => {
      const date = new Date(d.created_at || d.date);
      const dayIndex = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < 7) {
        deliveriesByDay[6 - dayIndex]++;
      }
    });

    filteredTransfers.forEach(t => {
      const date = new Date(t.created_at || t.date);
      const dayIndex = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < 7) {
        transfersByDay[6 - dayIndex]++;
      }
    });

    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Receipts',
          data: receiptsByDay,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Deliveries',
          data: deliveriesByDay,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Transfers',
          data: transfersByDay,
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const prepareStatusChartData = () => {
    const filteredReceipts = filterByDate(reportData.receipts);
    const filteredDeliveries = filterByDate(reportData.deliveries);

    const receiptStatuses = {
      draft: filteredReceipts.filter(r => r.status === 'draft').length,
      waiting: filteredReceipts.filter(r => r.status === 'waiting').length,
      ready: filteredReceipts.filter(r => r.status === 'ready').length,
      done: filteredReceipts.filter(r => r.status === 'done').length
    };

    const deliveryStatuses = {
      draft: filteredDeliveries.filter(d => d.status === 'draft').length,
      ready: filteredDeliveries.filter(d => d.status === 'ready').length,
      done: filteredDeliveries.filter(d => d.status === 'done').length
    };

    return {
      labels: ['Draft', 'Waiting', 'Ready', 'Done'],
      datasets: [
        {
          label: 'Receipts',
          data: [receiptStatuses.draft, receiptStatuses.waiting, receiptStatuses.ready, receiptStatuses.done],
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Deliveries',
          data: [deliveryStatuses.draft, 0, deliveryStatuses.ready, deliveryStatuses.done],
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        border: { display: false },
        grid: { display: false }
      }
    }
  };

  const exportReport = () => {
    const data = {
      dateRange,
      generatedAt: new Date().toISOString(),
      stats,
      summary: {
        totalProducts: reportData.products.length,
        totalReceipts: stats.totalReceipts,
        totalDeliveries: stats.totalDeliveries,
        totalTransfers: stats.totalTransfers,
        totalAdjustments: stats.totalAdjustments
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="text-blue-600" /> Reports & Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">Comprehensive insights into your inventory operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Total Receipts</p>
            <Package className="text-blue-600" size={20} />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{isLoading ? '...' : stats.totalReceipts}</h3>
          <p className="text-xs text-slate-400 mt-1">{stats.completedReceipts} completed</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Total Deliveries</p>
            <Truck className="text-emerald-600" size={20} />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{isLoading ? '...' : stats.totalDeliveries}</h3>
          <p className="text-xs text-slate-400 mt-1">{stats.completedDeliveries} completed</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Total Transfers</p>
            <ArrowLeftRight className="text-purple-600" size={20} />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{isLoading ? '...' : stats.totalTransfers}</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Pending Operations</p>
            <TrendingUp className="text-amber-600" size={20} />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{isLoading ? '...' : stats.pendingOperations}</h3>
          <p className="text-xs text-slate-400 mt-1">Requires attention</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Transaction Trends</h2>
          <div className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                Loading chart...
              </div>
            ) : (
              <Line data={prepareTransactionChartData()} options={chartOptions} />
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Status Distribution</h2>
          <div className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                Loading chart...
              </div>
            ) : (
              <Bar data={prepareStatusChartData()} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Activity Summary</h2>
          <Filter size={18} className="text-slate-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Completed</th>
                <th className="px-6 py-4 font-semibold">Pending</th>
                <th className="px-6 py-4 font-semibold">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr className="hover:bg-blue-50/30">
                <td className="px-6 py-4 font-medium text-slate-800">Receipts</td>
                <td className="px-6 py-4">{stats.totalReceipts}</td>
                <td className="px-6 py-4 text-emerald-600">{stats.completedReceipts}</td>
                <td className="px-6 py-4 text-amber-600">{stats.totalReceipts - stats.completedReceipts}</td>
                <td className="px-6 py-4">
                  {stats.totalReceipts > 0
                    ? `${Math.round((stats.completedReceipts / stats.totalReceipts) * 100)}%`
                    : '0%'}
                </td>
              </tr>
              <tr className="hover:bg-blue-50/30">
                <td className="px-6 py-4 font-medium text-slate-800">Deliveries</td>
                <td className="px-6 py-4">{stats.totalDeliveries}</td>
                <td className="px-6 py-4 text-emerald-600">{stats.completedDeliveries}</td>
                <td className="px-6 py-4 text-amber-600">{stats.totalDeliveries - stats.completedDeliveries}</td>
                <td className="px-6 py-4">
                  {stats.totalDeliveries > 0
                    ? `${Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100)}%`
                    : '0%'}
                </td>
              </tr>
              <tr className="hover:bg-blue-50/30">
                <td className="px-6 py-4 font-medium text-slate-800">Transfers</td>
                <td className="px-6 py-4">{stats.totalTransfers}</td>
                <td className="px-6 py-4 text-slate-500">--</td>
                <td className="px-6 py-4 text-slate-500">--</td>
                <td className="px-6 py-4 text-slate-500">--</td>
              </tr>
              <tr className="hover:bg-blue-50/30">
                <td className="px-6 py-4 font-medium text-slate-800">Adjustments</td>
                <td className="px-6 py-4">{stats.totalAdjustments}</td>
                <td className="px-6 py-4 text-slate-500">--</td>
                <td className="px-6 py-4 text-slate-500">--</td>
                <td className="px-6 py-4 text-slate-500">--</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
