import { Building2, MapPin, Package, Users, ChevronRight } from 'lucide-react';

const Warehouses = () => {
  const warehouses = [
    { id: 1, name: 'Main Warehouse', code: 'WH-Main', location: 'Mumbai, Maharashtra', manager: 'Rajesh Kumar', products: 186, capacity: '85%', color: 'blue' },
    { id: 2, name: 'Central Warehouse', code: 'WH-Central', location: 'Delhi, NCR', manager: 'Anita Sharma', products: 124, capacity: '62%', color: 'emerald' },
    { id: 3, name: 'East Warehouse', code: 'WH-East', location: 'Kolkata, West Bengal', manager: 'Suresh Patel', products: 78, capacity: '45%', color: 'violet' },
    { id: 4, name: 'West Warehouse', code: 'WH-West', location: 'Ahmedabad, Gujarat', manager: 'Priya Mehta', products: 40, capacity: '30%', color: 'amber' },
  ];

  const colorMap = {
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    icon: 'bg-blue-100 text-blue-600',    bar: 'bg-blue-500',    text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-600' },
    violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  icon: 'bg-violet-100 text-violet-600',  bar: 'bg-violet-500',  text: 'text-violet-600' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'bg-amber-100 text-amber-600',   bar: 'bg-amber-500',   text: 'text-amber-600' },
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Building2 className="text-blue-600" /> Warehouses
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your warehouse locations and storage capacity.</p>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map(wh => {
          const c = colorMap[wh.color];
          const pct = parseInt(wh.capacity);
          return (
            <div key={wh.id} className={`bg-white rounded-2xl shadow-sm border-2 ${c.border} hover:shadow-md transition-all cursor-pointer group overflow-hidden`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${c.icon}`}>
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{wh.name}</h2>
                      <span className="text-xs text-slate-400 font-mono">{wh.code}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-slate-400" /> {wh.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users size={14} className="text-slate-400" /> Manager: <span className="font-medium text-slate-800">{wh.manager}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Package size={14} className="text-slate-400" /> {wh.products} Products stored
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-500">Capacity Used</span>
                    <span className={c.text}>{wh.capacity}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Warehouses;
