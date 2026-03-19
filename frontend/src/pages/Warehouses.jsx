import { useState, useEffect } from 'react';
import { Building2, MapPin, Package, Plus } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageInfo from '../components/PageInfo';

const COLORS = ['blue', 'emerald', 'violet', 'amber'];
const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', bar: 'bg-blue-500', text: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-600' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'bg-violet-100 text-violet-600', bar: 'bg-violet-500', text: 'text-violet-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', bar: 'bg-amber-500', text: 'text-amber-600' },
};

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isManager } = useAuth();

  useEffect(() => {
    api.get('/warehouses').then((res) => {
      const list = res?.data ?? (Array.isArray(res) ? res : []);
      setWarehouses(list);
    }).catch(() => setWarehouses([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Building2 className="text-blue-600" /> Warehouses
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your warehouse locations. {isManager ? 'You can add or edit warehouses.' : 'You have access to your assigned warehouse.'}
          </p>
        </div>
        {isManager && (
          <button className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors">
            <Plus size={18} /> Add Warehouse
          </button>
        )}
      </div>

      <PageInfo
        title="What is the Warehouses page?"
        description="View and manage warehouse locations. Managers can add or edit warehouses. Warehouse staff see only their assigned warehouse."
        activities={[
          'View all warehouse locations and details',
          'Managers: Add new warehouses',
          'Managers: Edit or delete warehouses',
          'Warehouse staff: View your assigned warehouse only'
        ]}
      />

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : warehouses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500">
          No warehouses found. {isManager && 'Add a warehouse to get started.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses.map((wh, idx) => {
            const c = colorMap[COLORS[idx % COLORS.length]];
            return (
              <div key={wh.id} className={`bg-white rounded-2xl shadow-sm border-2 ${c.border} hover:shadow-md transition-all overflow-hidden`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${c.icon}`}>
                        <Building2 size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">{wh.name}</h2>
                        <span className="text-xs text-slate-400 font-mono">WH-{wh.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={14} className="text-slate-400" /> {wh.location || 'No location set'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Warehouses;
