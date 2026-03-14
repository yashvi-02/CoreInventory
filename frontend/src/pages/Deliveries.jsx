import { useState, useEffect } from 'react';
import { Plus, Truck, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { api } from '../services/api';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ customer: '', items: [{ product_id: '', quantity: '' }] });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [dRes, pRes] = await Promise.all([api.get('/deliveries'), api.get('/products')]);
      setDeliveries(Array.isArray(dRes.data) ? dRes.data : []);
      setProducts(Array.isArray(pRes.data) ? pRes.data : []);
    } catch { /* silent */ } finally { setIsLoading(false); }
  };

  const addItem = () => setFormData({...formData, items: [...formData.items, { product_id: '', quantity: '' }]});
  const removeItem = (idx) => setFormData({...formData, items: formData.items.filter((_, i) => i !== idx)});
  const updateItem = (idx, field, val) => {
    const items = [...formData.items];
    items[idx][field] = val;
    setFormData({...formData, items});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/deliveries', {
        customer: formData.customer,
        items: formData.items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      });
      setShowForm(false);
      setFormData({ customer: '', items: [{ product_id: '', quantity: '' }] });
      fetchAll();
    } catch (err) { alert('Failed: ' + err.message); }
  };

  const validateDelivery = async (id) => {
    const wId = prompt('Enter warehouse ID to ship from:');
    if (!wId) return;
    try {
      await api.post(`/deliveries/${id}/validate`, { warehouse_id: parseInt(wId) });
      fetchAll();
    } catch (err) { alert('Failed: ' + err.message); }
  };

  const statusBadge = (s) => {
    const colors = { draft: 'bg-slate-100 text-slate-700 border-slate-200', done: 'bg-emerald-50 text-emerald-700 border-emerald-200', ready: 'bg-amber-50 text-amber-700 border-amber-200' };
    return colors[s] || colors.draft;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Delivery Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage outgoing deliveries to customers.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all duration-300">
          <Plus size={18} /> New Delivery
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">New Delivery Order</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
              <input type="text" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors" placeholder="Customer name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Items</label>
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 mb-2">
                  <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} required
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors cursor-pointer">
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                  <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} required min="1" placeholder="Qty"
                    className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors" />
                  {formData.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>}
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1">+ Add Item</button>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors">Create Draft</button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Items</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
              ) : deliveries.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                  <Truck size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-lg font-medium text-slate-700">No deliveries yet</p>
                </td></tr>
              ) : deliveries.map(d => (
                <tr key={d.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-800">DEL-{String(d.id).padStart(4, '0')}</td>
                  <td className="px-6 py-4 text-slate-600">{d.customer}</td>
                  <td className="px-6 py-4 text-slate-600">{(d.items || []).length} items</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(d.status)}`}>
                      {d.status === 'done' ? <CheckCircle size={14} className="mr-1" /> : <Clock size={14} className="mr-1" />}
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{d.created_at ? new Date(d.created_at).toLocaleDateString() : '--'}</td>
                  <td className="px-6 py-4 text-right">
                    {d.status === 'draft' && (
                      <button onClick={() => validateDelivery(d.id)}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Validate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Deliveries;
