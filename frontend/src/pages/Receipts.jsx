import { useState } from 'react';
import { Search, Filter, Plus, FileText, LayoutList, LayoutGrid } from 'lucide-react';

const Receipts = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  
  const [receipts, setReceipts] = useState([
    { id: '1', reference: 'WH/IN/0001', from: 'Vendor A', to: 'WH/Stock1', contact: 'Azure Interior', scheduleDate: '2023-11-20', status: 'Ready' },
    { id: '2', reference: 'WH/IN/0002', from: 'Vendor B', to: 'WH/Stock1', contact: 'Azure Interior', scheduleDate: '2023-11-21', status: 'Ready' },
    { id: '3', reference: 'WH/IN/0003', from: 'Vendor C', to: 'WH/Stock2', contact: 'Wood Inc', scheduleDate: '2023-11-25', status: 'Waiting' },
    { id: '4', reference: 'WH/IN/0004', from: 'Vendor D', to: 'WH/Stock1', contact: 'Metal Works', scheduleDate: '2023-11-10', status: 'Late' },
  ]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="text-blue-600" /> Receipts
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage incoming goods and stock replenishment.</p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Plus size={18} /> New Receipt
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-md group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search receipts by reference or contacts..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={16} /> Filters
            </button>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutList size={18} />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content View */}
        {viewMode === 'list' ? (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">From</th>
                  <th className="px-6 py-4 font-semibold">To</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Schedule Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-medium text-blue-600">{receipt.reference}</td>
                    <td className="px-6 py-4 text-slate-600">{receipt.from}</td>
                    <td className="px-6 py-4 text-slate-600">{receipt.to}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                          {receipt.contact.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{receipt.contact}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{receipt.scheduleDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        receipt.status === 'Ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        receipt.status === 'Late' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {receipt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 flex-1">
            {/* Simple Kanban View Mockup */}
            {['Ready', 'Waiting', 'Late'].map(statusGroup => (
              <div key={statusGroup} className="flex flex-col gap-3">
                <h3 className="font-medium text-slate-700 px-1 border-b border-slate-200 pb-2">{statusGroup}</h3>
                {receipts.filter(r => r.status === statusGroup).map(receipt => (
                  <div key={receipt.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-blue-600 text-sm">{receipt.reference}</span>
                      <span className="text-xs text-slate-500">{receipt.scheduleDate}</span>
                    </div>
                    <p className="font-medium text-slate-800 text-sm mb-1">{receipt.contact}</p>
                    <p className="text-slate-500 text-xs">{receipt.from} &rarr; {receipt.to}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Receipts;
