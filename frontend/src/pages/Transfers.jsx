import { useState } from 'react';
import { ArrowLeftRight, Search, Filter, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import PageInfo from '../components/PageInfo';

const Transfers = () => {
  const [activeTab, setActiveTab] = useState('All');

  const [transactions] = useState([
    { id: 'TXN-0001', from: 'Acme Corp', to: 'WH-Main Account', amount: '₹1,25,000', date: '2023-11-25', method: 'NEFT', status: 'Completed' },
    { id: 'TXN-0002', from: 'Stellar Goods', to: 'WH-East Account', amount: '₹78,500', date: '2023-11-26', method: 'UPI', status: 'Pending' },
    { id: 'TXN-0003', from: 'Global Tech', to: 'WH-Main Account', amount: '₹2,45,000', date: '2023-11-22', method: 'RTGS', status: 'Completed' },
    { id: 'TXN-0004', from: 'First Choice Inc', to: 'WH-West Account', amount: '₹54,200', date: '2023-11-26', method: 'NEFT', status: 'In Process' },
    { id: 'TXN-0005', from: 'Beta Industries', to: 'WH-Main Account', amount: '₹3,10,000', date: '2023-11-20', method: 'RTGS', status: 'Pending' },
    { id: 'TXN-0006', from: 'Nova Supplies', to: 'WH-East Account', amount: '₹92,750', date: '2023-11-18', method: 'UPI', status: 'In Process' },
    { id: 'TXN-0007', from: 'Prime Distributors', to: 'WH-Central Account', amount: '₹1,68,000', date: '2023-11-15', method: 'NEFT', status: 'Completed' },
  ]);

  const tabs = ['All', 'Pending', 'In Process', 'Completed'];

  const filtered = activeTab === 'All' ? transactions : transactions.filter(t => t.status === activeTab);

  const statusIcon = (status) => {
    if (status === 'Completed') return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (status === 'In Process') return <Loader2 size={14} className="text-blue-500 animate-spin" />;
    return <Clock size={14} className="text-amber-500" />;
  };

  const statusStyle = (status) => {
    if (status === 'Completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'In Process') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  // Summary counts
  const pending = transactions.filter(t => t.status === 'Pending').length;
  const inProcess = transactions.filter(t => t.status === 'In Process').length;
  const completed = transactions.filter(t => t.status === 'Completed').length;

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="text-blue-600" /> Transfers
          </h1>
          <p className="text-slate-500 text-sm mt-1">Move stock between warehouses.</p>
        </div>
      </div>

      <PageInfo
        title="What is the Transfers page?"
        description="Move inventory from one warehouse to another. Create transfer requests and validate them to update stock in both locations."
        activities={[
          'Create stock transfers between warehouses',
          'Specify source and destination warehouses',
          'Add products and quantities to transfer',
          'Validate transfers to complete the move',
          'Managers only: warehouse staff cannot create cross-warehouse transfers'
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl"><Clock size={24} className="text-amber-600" /></div>
          <div>
            <p className="text-sm text-amber-700 font-medium">Pending</p>
            <p className="text-2xl font-bold text-amber-800">{pending}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl"><Loader2 size={24} className="text-blue-600" /></div>
          <div>
            <p className="text-sm text-blue-700 font-medium">In Process</p>
            <p className="text-2xl font-bold text-blue-800">{inProcess}</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl"><CheckCircle2 size={24} className="text-emerald-600" /></div>
          <div>
            <p className="text-sm text-emerald-700 font-medium">Completed</p>
            <p className="text-2xl font-bold text-emerald-800">{completed}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input type="text" placeholder="Search transactions..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-56" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold">From</th>
                <th className="px-6 py-4 font-semibold">To</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map(txn => (
                <tr key={txn.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-blue-600">{txn.id}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{txn.from}</td>
                  <td className="px-6 py-4 text-slate-600">{txn.to}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{txn.amount}</td>
                  <td className="px-6 py-4 text-slate-500">{txn.method}</td>
                  <td className="px-6 py-4 text-slate-600">{txn.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle(txn.status)}`}>
                      {statusIcon(txn.status)} {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transfers;
