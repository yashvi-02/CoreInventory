import { Package, Inbox, AlertTriangle, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  // Mock data aligned to the user's legacy structure
  const metrics = [
    { title: 'Total Products', value: '428', icon: <Package size={24} />, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12%', trendUp: true },
    { title: 'Total Quantity', value: '12,450', icon: <Inbox size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+5%', trendUp: true },
    { title: 'Low Stock Alerts', value: '14', icon: <AlertTriangle size={24} />, color: 'text-rose-600', bg: 'bg-rose-100', trend: '-2%', trendUp: false },
    { title: 'Pending Adjustments', value: '7', icon: <Activity size={24} />, color: 'text-amber-600', bg: 'bg-amber-100', trend: '+1', trendUp: true },
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        label: 'Inventory Value ($)',
        data: [12000, 19000, 15000, 22000, 28000, 24000, 31000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { border: { display: false }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { border: { display: false }, grid: { display: false } },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
  };

  const activities = [
    { id: 1, action: 'Added product: Macbook Pro M3', time: '10 mins ago', type: 'add' },
    { id: 2, action: 'Stock updated for iPhone 15 Pro', time: '1 hour ago', type: 'update' },
    { id: 3, action: 'User admin@coreinventory logged in', time: '2 hours ago', type: 'system' },
    { id: 4, action: 'System started', time: '1 day ago', type: 'system' },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back. Here's what's happening with your inventory today.</p>
        </div>
        <button className="self-start sm:self-auto bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
          Download Report
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{metric.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{metric.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${metric.bg} ${metric.color}`}>
                {metric.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-sm font-medium ${metric.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {metric.trend}
              </span>
              <span className="text-slate-400 text-xs">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Inventory Value Trend</h2>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition-colors cursor-pointer outline-none">
              <option>Last 7 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="flex-1 w-full min-h-[300px] relative">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col max-h-[420px]">
          <h2 className="text-lg font-bold text-slate-800 mb-6 shrink-0">Recent Activity</h2>
          
          <div className="overflow-y-auto fancy-scrollbar pr-2 space-y-6 relative flex-1">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 -z-10"></div>
            
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 group">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 border-white ring-2 ${
                  activity.type === 'add' ? 'bg-emerald-500 ring-emerald-100' : 
                  activity.type === 'update' ? 'bg-blue-500 ring-blue-100' : 'bg-slate-400 ring-slate-100'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                    {activity.action}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-200">
            View All Activity
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
