import { useState, useEffect } from 'react';
import { Plus, Truck, CheckCircle, Clock, Trash2, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import PageInfo from '../components/PageInfo';

const DeliveryOrders = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    customer: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    mobile: '',
    email: '',
    items: [{ product_id: '', quantity: '' }]
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [dRes, pRes, wRes] = await Promise.all([
        api.get('/deliveries').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/warehouses').catch(() => ({ data: [] }))
      ]);
      setDeliveries(Array.isArray(dRes.data) ? dRes.data : []);
      setProducts(Array.isArray(pRes.data) ? pRes.data : []);
      setWarehouses(Array.isArray(wRes.data) ? wRes.data : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: '' }]
    });
  };

  const removeItem = (idx) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== idx)
      });
    }
  };

  const updateItem = (idx, field, val) => {
    const items = [...formData.items];
    items[idx][field] = val;
    setFormData({ ...formData, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/deliveries', {
        customer: formData.customer,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pin_code: formData.pin_code,
        mobile: formData.mobile,
        email: formData.email,
        items: formData.items.map(i => ({
          product_id: parseInt(i.product_id),
          quantity: parseInt(i.quantity)
        }))
      });
      setShowForm(false);
      setFormData({
        customer: '',
        address: '',
        city: '',
        state: '',
        pin_code: '',
        mobile: '',
        email: '',
        items: [{ product_id: '', quantity: '' }]
      });
      fetchAll();
    } catch (err) {
      alert('Failed to create delivery: ' + (err.message || 'Unknown error'));
    }
  };

  const validateDelivery = async (id) => {
    const warehouseOptions = warehouses.map(w => `${w.id}: ${w.name}`).join('\n');
    const wId = prompt(`Enter warehouse ID to ship from:\n\nAvailable warehouses:\n${warehouseOptions}`);
    if (!wId) return;
    try {
      await api.post(`/deliveries/${id}/validate`, { warehouse_id: parseInt(wId) });
      fetchAll();
    } catch (err) {
      alert('Failed to validate delivery: ' + (err.message || 'Unknown error'));
    }
  };

  const statusBadge = (s) => {
    const colors = {
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
      done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      ready: 'bg-amber-50 text-amber-700 border-amber-200'
    };
    return colors[s] || colors.draft;
  };

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = !searchQuery || 
      d.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(d.id).includes(searchQuery);
    const matchesStatus = !statusFilter || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Delivery Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage outgoing deliveries to customers.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all duration-300"
        >
          <Plus size={18} /> New Delivery Order
        </button>
      </div>

      <PageInfo
        title="What is the Delivery Orders page?"
        description="Manage outgoing shipments to customers. Create delivery orders and validate them to deduct stock from a warehouse."
        activities={[
          'Create new delivery orders with customer details and items',
          'Add multiple products and quantities per order',
          'Validate deliveries to deduct stock from the chosen warehouse',
          'View and filter all deliveries by status',
          'Warehouse staff can only validate into their assigned warehouse'
        ]}
      />

      {/* Form */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-[900px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">New Delivery Order</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={e => setFormData({ ...formData, customer: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile *</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pin Code</label>
                <input
                  type="text"
                  value={formData.pin_code}
                  onChange={e => setFormData({ ...formData, pin_code: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="123456"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="State"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Items *</label>
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 mb-2">
                  <select
                    value={item.product_id}
                    onChange={e => updateItem(idx, 'product_id', e.target.value)}
                    required
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.sku ? `(${p.sku})` : ''}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateItem(idx, 'quantity', e.target.value)}
                    required
                    min="1"
                    placeholder="Qty"
                    className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
              >
                + Add Item
              </button>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors"
              >
                Create Draft
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Items</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <Clock size={32} className="mx-auto mb-2 animate-spin" />
                    Loading...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <Truck size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-700">No deliveries found</p>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map(d => (
                  <tr key={d.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-800">DEL-{String(d.id).padStart(4, '0')}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{d.customer || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {d.mobile || d.email || '--'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {(d.items || []).length} item{(d.items || []).length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(d.status)}`}>
                        {d.status === 'done' ? <CheckCircle size={14} className="mr-1" /> : <Clock size={14} className="mr-1" />}
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {d.status === 'draft' && (
                        <button
                          onClick={() => validateDelivery(d.id)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Validate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrders;
