import { useState, useEffect } from 'react';
import { BookOpen, Filter } from 'lucide-react';
import { api } from '../services/api';

const Ledger = () => {
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [lRes, pRes, wRes] = await Promise.all([api.get('/ledger'), api.get('/products'), api.get('/warehouses')]);
      setEntries(Array.isArray(lRes.data) ? lRes.data : []);
      setProducts(Array.isArray(pRes.data) ? pRes.data : []);
      setWarehouses(Array.isArray(wRes.data) ? wRes.data : []);
    } catch { /* silent */ } finally { setIsLoading(false); }
  };

  const filtered = filterType ? entries.filter(e => e.type === filterType) : entries;

  const typeBadge = (t) => {
    const c = { receipt: 'bg-emerald-50 text-emerald-700 border-emerald-200', delivery: 'bg-blue-50 text-blue-700 border-blue-200', transfer: 'bg-purple-50 text-purple-700 border-purple-200', adjustment: 'bg-amber-50 text-amber-700 border-amber-200' };
    return c[t] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock Ledger</h1>
          <p className="text-slate-500 text-sm mt-1">Full audit trail of all stock movements.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm cursor-pointer">
            <option value="">All Types</option>
            <option value="receipt">Receipt</option>
            <option value="delivery">Delivery</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
              <th className="px-6 py-4 font-semibold">ID</th><th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Product</th><th className="px-6 py-4 font-semibold">Warehouse</th>
              <th className="px-6 py-4 font-semibold">Quantity</th><th className="px-6 py-4 font-semibold">Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
            : filtered.length === 0 ? <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500"><BookOpen size={48} className="mx-auto text-slate-300 mb-4" /><p>No ledger entries</p></td></tr>
            : filtered.map(e => (
              <tr key={e.id} className="hover:bg-blue-50/30">
                <td className="px-6 py-4 font-medium">{e.id}</td>
                <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${typeBadge(e.type)}`}>{e.type}</span></td>
                <td className="px-6 py-4">{products.find(p=>p.id===e.product_id)?.name || `#${e.product_id}`}</td>
                <td className="px-6 py-4">{warehouses.find(w=>w.id===e.warehouse_id)?.name || `#${e.warehouse_id}`}</td>
                <td className="px-6 py-4 font-semibold">{e.quantity >= 0 ? '+' : ''}{e.quantity}</td>
                <td className="px-6 py-4 text-slate-500">{e.reference_id || '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ledger;
