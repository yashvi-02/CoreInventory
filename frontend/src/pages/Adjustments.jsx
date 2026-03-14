import { useState, useEffect } from 'react';
import { Plus, Settings2 } from 'lucide-react';
import { api } from '../services/api';

const Adjustments = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ product_id: '', warehouse_id: '', new_quantity: '', reason: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [aRes, pRes, wRes] = await Promise.all([api.get('/adjustments'), api.get('/products'), api.get('/warehouses')]);
      setAdjustments(Array.isArray(aRes.data) ? aRes.data : []);
      setProducts(Array.isArray(pRes.data) ? pRes.data : []);
      setWarehouses(Array.isArray(wRes.data) ? wRes.data : []);
    } catch { /* silent */ } finally { setIsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/adjustments', {
        product_id: parseInt(formData.product_id),
        warehouse_id: parseInt(formData.warehouse_id),
        new_quantity: parseInt(formData.new_quantity),
        reason: formData.reason
      });
      setShowForm(false);
      setFormData({ product_id: '', warehouse_id: '', new_quantity: '', reason: '' });
      fetchAll();
    } catch (err) { alert('Failed: ' + err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Adjustments</h1>
          <p className="text-slate-500 text-sm mt-1">Manually adjust stock quantities.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:bg-blue-700 transition-all">
          <Plus size={18} /> New Adjustment
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-500 ${showForm ? 'max-h-[600px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">New Adjustment</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
              <select value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse *</label>
              <select value={formData.warehouse_id} onChange={e => setFormData({...formData, warehouse_id: e.target.value})} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <option value="">Select Warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Quantity *</label>
              <input type="number" value={formData.new_quantity} onChange={e => setFormData({...formData, new_quantity: e.target.value})} required min="0" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
              <input type="text" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="e.g. Damaged" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">Apply</button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
              <th className="px-6 py-4 font-semibold">ID</th><th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Previous</th><th className="px-6 py-4 font-semibold">New</th>
              <th className="px-6 py-4 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
            : adjustments.length === 0 ? <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500"><Settings2 size={48} className="mx-auto text-slate-300 mb-4" /><p>No adjustments yet</p></td></tr>
            : adjustments.map(a => (
              <tr key={a.id} className="hover:bg-blue-50/30">
                <td className="px-6 py-4 font-medium">ADJ-{String(a.id).padStart(4,'0')}</td>
                <td className="px-6 py-4">{products.find(p=>p.id===a.product_id)?.name || `#${a.product_id}`}</td>
                <td className="px-6 py-4 text-slate-500">{a.previous_quantity ?? '--'}</td>
                <td className="px-6 py-4 font-semibold">{a.new_quantity ?? '--'}</td>
                <td className="px-6 py-4 text-slate-500">{a.reason || '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Adjustments;
