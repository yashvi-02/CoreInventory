import { useState, useEffect } from 'react';
import { Plus, Building2, Edit2, Trash2, MapPin } from 'lucide-react';
import { api } from '../services/api';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '' });

  useEffect(() => { fetchWarehouses(); }, []);

  const fetchWarehouses = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/warehouses');
      setWarehouses(Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
    } catch { /* silent */ } finally { setIsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/warehouses', formData);
      setShowForm(false);
      setFormData({ name: '', location: '' });
      fetchWarehouses();
    } catch (err) { alert('Failed: ' + err.message); }
  };

  const deleteWarehouse = async (id) => {
    if (!window.confirm('Delete this warehouse?')) return;
    try { await api.delete(`/warehouses/${id}`); fetchWarehouses(); }
    catch (err) { alert('Failed: ' + err.message); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Warehouses</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your storage locations.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all duration-300">
          <Plus size={18} /> Add Warehouse
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-[400px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Add Warehouse</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors" placeholder="Main Warehouse" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors" placeholder="123 Street, City" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors">Save</button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading warehouses...</div>
        ) : warehouses.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">
            <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">No warehouses yet</p>
            <p className="text-sm">Click "Add Warehouse" to create one.</p>
          </div>
        ) : warehouses.map(wh => (
          <div key={wh.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600"><Building2 size={24} /></div>
                <div>
                  <h3 className="font-bold text-slate-800">{wh.name}</h3>
                  {wh.location && <p className="text-slate-500 text-sm flex items-center gap-1 mt-1"><MapPin size={14} />{wh.location}</p>}
                </div>
              </div>
              <button onClick={() => deleteWarehouse(wh.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Warehouses;
