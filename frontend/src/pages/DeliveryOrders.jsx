import { useState } from 'react';
import { Truck, Plus, Search, Filter, MapPin, Package, User, Map, Phone, Mail, AlertCircle, Info, XCircle } from 'lucide-react';

const DeliveryOrders = () => {
  const [deliveryOrders, setDeliveryOrders] = useState([
    { id: 'DO-2023-001', customer: 'Acme Corp', status: 'In Transit', date: '2023-11-25', location: 'WH-East', items: 12 },
    { id: 'DO-2023-002', customer: 'Stellar Goods', status: 'Pending', date: '2023-11-26', location: 'WH-Main', items: 3 },
    { id: 'DO-2023-003', customer: 'Global Tech', status: 'Delivered', date: '2023-11-22', location: 'WH-East', items: 45 },
    { id: 'DO-2023-004', customer: 'First Choice Inc', status: 'Late', date: '2023-11-26', location: 'WH-West', items: 1 },
    { id: 'DO-2023-005', customer: 'Beta Industries', status: 'Cancelled', date: '2023-11-20', location: 'WH-Main', items: 5 },
  ]);

  const [formData, setFormData] = useState({
    name: '', address: '', city: '', state: '', pinCode: '', phone: '', email: ''
  });
  
  const maxAddressChars = 300; // Roughly 50-60 words

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'address' && value.length > maxAddressChars) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newOrder = {
      id: `DO-2023-${(deliveryOrders.length + 1).toString().padStart(3, '0')}`,
      customer: formData.name,
      status: 'Pending', // Default status for new orders
      date: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
      location: formData.city, // using city as placeholder location
      items: Math.floor(Math.random() * 10) + 1 // dummy random 1-10 items
    };

    setDeliveryOrders([newOrder, ...deliveryOrders]);
    
    // Clear form
    setFormData({
      name: '', address: '', city: '', state: '', pinCode: '', phone: '', email: ''
    });
  };

  // Helper to cycle statuses for demonstration
  const handleStatusClick = (orderId) => {
    const statuses = ['Pending', 'In Transit', 'Delivered', 'Late', 'Cancelled'];
    setDeliveryOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const currentIndex = statuses.indexOf(order.status);
          const nextIndex = (currentIndex + 1) % statuses.length;
          return { ...order, status: statuses[nextIndex] };
        }
        return order;
      })
    );
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Truck className="text-blue-600" /> Delivery Orders
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage outbound shipments and delivery tracking.</p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Plus size={18} /> New Delivery
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer Details Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
              <User size={20} className="text-blue-500" /> Dispatch To
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                  <span>Full Address *</span>
                  <span className={`text-xs ${formData.address.length >= maxAddressChars ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                    {formData.address.length} / {maxAddressChars} chars
                  </span>
                </label>
                <textarea 
                  required
                  name="address"
                  rows="3"
                  maxLength={maxAddressChars}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Enter complete street address..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                  <input 
                    type="text" name="city" value={formData.city} onChange={handleInputChange} required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                  <input 
                    type="text" name="state" value={formData.state} onChange={handleInputChange} required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pin Code *</label>
                  <div className="relative">
                    <Map size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} required pattern="[0-9]{6}" title="6 digit Pin Code" maxLength="6"
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                      placeholder="e.g. 110001"
                    />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile No *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required pattern="[0-9]{10}" title="10 digit Mobile Number" maxLength="10"
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                      placeholder="10 digit number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email ID</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                    placeholder="Customer email (optional)"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full mt-4 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Place Order
              </button>
            </form>
          </div>
        </div>

        {/* Orders Listing */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-xs group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search deliveries..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-300"
                />
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter size={16} /> Filters
              </button>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {deliveryOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-blue-600">{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{order.customer}</p>
                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                          <Package size={12} /> {order.items} items
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleStatusClick(order.id)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border cursor-pointer hover:shadow-sm transition-all ${
                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                            order.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' :
                            order.status === 'Late' ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' :
                            order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' :
                            'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {order.status}
                        </button>
                        
                        {/* Status Messages */}
                        {order.status === 'Late' && (
                          <div className="mt-2 text-xs text-orange-600 flex items-start gap-1 max-w-[180px]">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>Late Delivery. Updated Expected Date: 2023-11-28</span>
                          </div>
                        )}
                        {order.status === 'In Transit' && (
                          <div className="mt-2 text-xs text-blue-600 flex items-start gap-1 max-w-[180px]">
                            <Info size={14} className="shrink-0 mt-0.5" />
                            <span>Soon to be delivered! Out for dispatch.</span>
                          </div>
                        )}
                        {order.status === 'Cancelled' && (
                          <div className="mt-2 text-xs text-rose-600 flex items-start gap-1 max-w-[180px]">
                            <XCircle size={14} className="shrink-0 mt-0.5" />
                            <span>Order Cancelled: Due to technical issues.</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 align-top">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DeliveryOrders;
