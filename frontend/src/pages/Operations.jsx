import { useNavigate } from 'react-router-dom';
import { FileText, Truck, ArrowRight, Clock, Layers, AlertTriangle } from 'lucide-react';

const Operations = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Layers className="text-blue-600" /> Operations
        </h1>
        <p className="text-slate-500 text-sm mt-1">View and manage all warehouse operations at a glance.</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Receipt Card */}
        <div
          onClick={() => navigate('/receipts')}
          className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                <FileText className="text-blue-500" size={24} /> Receipt
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <button className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-blue-500/20 group-hover:-translate-y-0.5 group-hover:bg-blue-700 transition-all flex items-center gap-2 text-sm">
                4 To Receive <ArrowRight size={16} />
              </button>
              <div className="space-y-2 text-sm font-medium">
                <p className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle size={14} /> 1 Late
                </p>
                <p className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} /> 6 Operations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Card */}
        <div
          onClick={() => navigate('/delivery')}
          className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                <Truck className="text-blue-500" size={24} /> Delivery
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <button className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-blue-500/20 group-hover:-translate-y-0.5 group-hover:bg-blue-700 transition-all flex items-center gap-2 text-sm">
                4 To Deliver <ArrowRight size={16} />
              </button>
              <div className="space-y-2 text-sm font-medium">
                <p className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle size={14} /> 1 Late
                </p>
                <p className="flex items-center gap-2 text-blue-600">
                  <Clock size={14} /> 2 Waiting
                </p>
                <p className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} /> 6 Operations
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Warehouse Locations - placeholder section below the cards */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 min-h-[200px]">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Locations of Warehouse</h2>
        <p className="text-slate-400 text-sm">Warehouse map and location data will appear here.</p>
      </div>

    </div>
  );
};

export default Operations;
