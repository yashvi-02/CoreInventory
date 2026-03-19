import { useState, useEffect } from 'react';
import { Search, Plus, FileText, LayoutList, LayoutGrid } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageInfo from '../components/PageInfo';

const Receipts = () => {
  const [viewMode, setViewMode] = useState('list');
  const [receipts, setReceipts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { isManager, warehouseId } = useAuth();

  useEffect(() => {
    api.get('/receipts').then((res) => {
      const list = res?.data ?? (Array.isArray(res) ? res : []);
      setReceipts(list);
    }).catch(() => setReceipts([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/warehouses').then((res) => {
      const list = res?.data ?? (Array.isArray(res) ? res : []);
      setWarehouses(list);
    }).catch(() => setWarehouses([]));
  }, []);

  const filteredReceipts = receipts.filter((r) => {
    const q = searchQuery.toLowerCase();
    return !q || (r.supplier && r.supplier.toLowerCase().includes(q)) || String(r.id).includes(q);
  });

  const statusGroups = ['draft', 'waiting', 'done'];

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="text-blue-600" /> Receipts
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage incoming goods and stock replenishment.</p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors">
          <Plus size={18} /> New Receipt
        </button>
      </div>

      <PageInfo
        title="What is the Receipts page?"
        description="Manage incoming goods and stock replenishment. Create draft receipts for incoming stock, then validate them to add stock to a warehouse."
        activities={[
          'Create new receipts with supplier and items',
          'View all receipts in list or kanban view',
          'Validate drafts to add stock to a warehouse',
          'Search and filter receipts',
          ...(!isManager && warehouseId ? ['You can only validate receipts into your assigned warehouse'] : [])
        ]}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-md group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by supplier or ID..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
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

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 py-12">Loading...</div>
        ) : viewMode === 'list' ? (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Supplier</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">RCP-{r.id}</td>
                    <td className="px-6 py-4 text-slate-600">{r.supplier || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{(r.items || []).length} item(s)</td>
                    <td className="px-6 py-4 text-slate-600">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        r.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        r.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredReceipts.length === 0 && (
              <div className="p-12 text-center text-slate-500">No receipts found.</div>
            )}
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 flex-1">
            {statusGroups.map((status) => (
              <div key={status} className="flex flex-col gap-3">
                <h3 className="font-medium text-slate-700 px-1 border-b border-slate-200 pb-2 capitalize">{status}</h3>
                {filteredReceipts.filter((r) => r.status === status).map((r) => (
                  <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-blue-600 text-sm">RCP-{r.id}</span>
                      <span className="text-xs text-slate-500">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800 text-sm">{r.supplier || 'No supplier'}</p>
                    <p className="text-slate-500 text-xs">{(r.items || []).length} item(s)</p>
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
