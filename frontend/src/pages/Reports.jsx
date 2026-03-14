import { useState } from 'react';
import { LineChart, Send, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const Reports = () => {
  const [formData, setFormData] = useState({
    category: '',
    orderId: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const [complaints] = useState([
    { id: 'CMP-001', category: 'Late Delivery', orderId: 'DO-2023-004', description: 'Order was supposed to arrive on Nov 22 but still not delivered.', date: '2023-11-25', status: 'Open' },
    { id: 'CMP-002', category: 'Payment Issue', orderId: 'TXN-0002', description: 'Payment was debited but not reflected in seller dashboard.', date: '2023-11-24', status: 'In Review' },
    { id: 'CMP-003', category: 'Late Delivery', orderId: 'DO-2023-001', description: 'Delivery was late by 3 days. Customer complained.', date: '2023-11-20', status: 'Resolved' },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ category: '', orderId: '', description: '' });
  };

  const statusStyle = (status) => {
    if (status === 'Resolved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'In Review') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const statusIcon = (status) => {
    if (status === 'Resolved') return <CheckCircle2 size={14} />;
    if (status === 'In Review') return <Clock size={14} />;
    return <AlertTriangle size={14} />;
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <LineChart className="text-blue-600" /> Reports &amp; Complaints
        </h1>
        <p className="text-slate-500 text-sm mt-1">Report issues regarding late deliveries, payment problems, or other concerns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Complaint Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
              <AlertTriangle size={20} className="text-rose-500" /> File a Complaint
            </h2>

            {submitted && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 size={16} /> Complaint submitted successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select
                  name="category" value={formData.category} onChange={handleChange} required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">Select a category</option>
                  <option value="Late Delivery">Late Delivery</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Damaged Goods">Damaged Goods</option>
                  <option value="Wrong Item">Wrong Item Received</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Related Order / Transaction ID</label>
                <input
                  type="text" name="orderId" value={formData.orderId} onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="e.g. DO-2023-004 or TXN-0002"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea
                  name="description" value={formData.description} onChange={handleChange} required
                  rows="4"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Describe your issue in detail..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                <Send size={16} /> Submit Complaint
              </button>
            </form>
          </div>
        </div>

        {/* Complaints History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">Complaint History</h2>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Order</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {complaints.map(c => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-blue-600">{c.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{c.category}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{c.orderId}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-[250px] truncate">{c.description}</td>
                      <td className="px-6 py-4 text-slate-600">{c.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle(c.status)}`}>
                          {statusIcon(c.status)} {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
