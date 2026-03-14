import { BookOpenText, Search, Filter, MoreVertical, Eye, Download } from 'lucide-react';

const StockLedger = () => {
  const stockHistory = [
    { id: 1, date: '2023-11-20', product: 'MacBook Pro M3', type: 'Receipt', reference: 'REC-001', qty: '+50', unitCost: '$1,299.00', balance: 50, location: 'WH-East' },
    { id: 2, date: '2023-11-21', product: 'MacBook Pro M3', type: 'Delivery', reference: 'DEL-104', qty: '-5', unitCost: '$1,299.00', balance: 45, location: 'WH-East' },
    { id: 3, date: '2023-11-22', product: 'Ergonomic Chair', type: 'Receipt', reference: 'REC-002', qty: '+20', unitCost: '$145.00', balance: 20, location: 'WH-Main' },
    { id: 4, date: '2023-11-23', product: 'Ergonomic Chair', type: 'Delivery', reference: 'DEL-108', qty: '-8', unitCost: '$145.00', balance: 12, location: 'WH-Main' },
    { id: 5, date: '2023-11-25', product: 'Wireless Mouse', type: 'Adjustment', reference: 'ADJ-044', qty: '-2', unitCost: '$45.00', balance: 118, location: 'WH-West' },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpenText className="text-blue-600" /> Stock Ledger
          </h1>
          <p className="text-slate-500 text-sm mt-1">Detailed history of all inventory movements and stock levels.</p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
          <Download size={18} /> Export Ledger
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search movements by reference or product..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-300"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Filter size={16} /> Filter
          </button>
          <select className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-4 py-2 transition-colors cursor-pointer outline-none">
            <option>All Locations</option>
            <option>WH-Main</option>
            <option>WH-East</option>
            <option>WH-West</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Reference</th>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold text-right">Qty Change</th>
                <th className="px-6 py-4 font-semibold text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {stockHistory.map((record) => (
                <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{record.date}</td>
                  <td className="px-6 py-4 font-medium text-blue-600 cursor-pointer hover:underline">{record.reference}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{record.product}</td>
                  <td className="px-6 py-4 text-slate-600">{record.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      record.type === 'Receipt' ? 'bg-emerald-50 text-emerald-700' :
                      record.type === 'Delivery' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold ${record.qty.startsWith('+') ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {record.qty}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    {record.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <p>Showing <span className="font-medium text-slate-800">1</span> to <span className="font-medium text-slate-800">{stockHistory.length}</span> of <span className="font-medium text-slate-800">428</span> entries</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StockLedger;
