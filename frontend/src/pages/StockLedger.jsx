import { useState, useEffect } from 'react';
import { BookOpen, Filter, Search, Download } from 'lucide-react';
import { api } from '../services/api';
import PageInfo from '../components/PageInfo';

const StockLedger = () => {
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterProduct) params.append('product_id', filterProduct);
      if (filterWarehouse) params.append('warehouse_id', filterWarehouse);

      const [lRes, pRes, wRes] = await Promise.all([
        api.get(`/ledger${params.toString() ? '?' + params.toString() : ''}`).catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/warehouses').catch(() => ({ data: [] }))
      ]);

      setEntries(Array.isArray(lRes.data) ? lRes.data : []);
      setProducts(Array.isArray(pRes.data) ? pRes.data : []);
      setWarehouses(Array.isArray(wRes.data) ? wRes.data : []);
    } catch (err) {
      console.error('Failed to fetch ledger data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [filterType, filterProduct, filterWarehouse]);

  const typeBadge = (t) => {
    const c = {
      receipt: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      delivery: 'bg-blue-50 text-blue-700 border-blue-200',
      transfer: 'bg-purple-50 text-purple-700 border-purple-200',
      adjustment: 'bg-amber-50 text-amber-700 border-amber-200'
    };
    return c[t] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = !searchQuery ||
      String(e.id).includes(searchQuery) ||
      products.find(p => p.id === e.product_id)?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouses.find(w => w.id === e.warehouse_id)?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const exportLedger = () => {
    const csv = [
      ['ID', 'Type', 'Product', 'Warehouse', 'Quantity', 'Reference ID', 'Date'].join(','),
      ...filteredEntries.map(e => [
        e.id,
        e.type,
        products.find(p => p.id === e.product_id)?.name || `#${e.product_id}`,
        warehouses.find(w => w.id === e.warehouse_id)?.name || `#${e.warehouse_id}`,
        e.quantity,
        e.reference_id || '',
        e.created_at || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="text-blue-600" /> Stock Ledger
          </h1>
          <p className="text-slate-500 text-sm mt-1">Complete audit trail of all stock movements and transactions.</p>
        </div>
        <button
          onClick={exportLedger}
          className="self-start sm:self-auto flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <PageInfo
        title="What is the Stock Ledger?"
        description="A complete audit trail of every stock movement. Every receipt, delivery, transfer, and adjustment is recorded here."
        activities={[
          'View all stock transactions in chronological order',
          'Filter by type (receipt, delivery, transfer, adjustment)',
          'Filter by product or warehouse',
          'Search and export to CSV for analysis',
          'Warehouse staff see only their warehouse transactions'
        ]}
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ID, product, or warehouse..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Types</option>
            <option value="receipt">Receipt</option>
            <option value="delivery">Delivery</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <select
            value={filterProduct}
            onChange={e => setFilterProduct(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={filterWarehouse}
            onChange={e => setFilterWarehouse(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-sm text-emerald-700 font-medium mb-1">Receipts</p>
          <p className="text-2xl font-bold text-emerald-800">
            {filteredEntries.filter(e => e.type === 'receipt').length}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium mb-1">Deliveries</p>
          <p className="text-2xl font-bold text-blue-800">
            {filteredEntries.filter(e => e.type === 'delivery').length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-700 font-medium mb-1">Transfers</p>
          <p className="text-2xl font-bold text-purple-800">
            {filteredEntries.filter(e => e.type === 'transfer').length}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700 font-medium mb-1">Adjustments</p>
          <p className="text-2xl font-bold text-amber-800">
            {filteredEntries.filter(e => e.type === 'adjustment').length}
          </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Warehouse</th>
                <th className="px-6 py-4 font-semibold">Quantity</th>
                <th className="px-6 py-4 font-semibold">Reference</th>
                <th className="px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4 animate-pulse" />
                    Loading ledger entries...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-700">No ledger entries found</p>
                    <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map(e => (
                  <tr key={e.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">#{e.id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${typeBadge(e.type)}`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800">
                      {products.find(p => p.id === e.product_id)?.name || `Product #${e.product_id}`}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {warehouses.find(w => w.id === e.warehouse_id)?.name || `Warehouse #${e.warehouse_id}`}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${e.quantity >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {e.quantity >= 0 ? '+' : ''}{e.quantity}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {e.reference_id || '--'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {e.created_at ? new Date(e.created_at).toLocaleString() : '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info */}
      {!isLoading && filteredEntries.length > 0 && (
        <div className="text-center text-sm text-slate-500">
          Showing {filteredEntries.length} of {entries.length} ledger entries
        </div>
      )}
    </div>
  );
};

export default StockLedger;
