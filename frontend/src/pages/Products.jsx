import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'MacBook Pro M3', sku: 'LAP-001', category: 'Electronics', stock: 45, reorder: 10, status: 'In Stock' },
    { id: 2, name: 'Ergonomic Chair', sku: 'FUR-042', category: 'Furniture', stock: 12, reorder: 15, status: 'Low Stock' },
    { id: 3, name: 'Wireless Mouse', sku: 'ACC-089', category: 'Electronics', stock: 120, reorder: 20, status: 'In Stock' },
    { id: 4, name: 'Standing Desk', sku: 'FUR-005', category: 'Furniture', stock: 5, reorder: 10, status: 'Low Stock' },
    { id: 5, name: 'USB-C Hub', sku: 'ACC-112', category: 'Electronics', stock: 0, reorder: 30, status: 'Out of Stock' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', sku: '', category: 'Electronics', stock: '', reorder: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: products.length + 1,
      ...formData,
      stock: parseInt(formData.stock),
      reorder: parseInt(formData.reorder),
      status: parseInt(formData.stock) > parseInt(formData.reorder) ? 'In Stock' : (parseInt(formData.stock) > 0 ? 'Low Stock' : 'Out of Stock')
    };
    setProducts([...products, newProduct]);
    setShowForm(false);
    setFormData({ name: '', sku: '', category: 'Electronics', stock: '', reorder: '' });
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your inventory catalog and stock levels.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Add Product Form (Collapsible) */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleInputChange} required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                placeholder="e.g. MacBook Pro M3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
              <input 
                type="text" name="sku" value={formData.sku} onChange={handleInputChange} required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                placeholder="e.g. LAP-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                name="category" value={formData.category} onChange={handleInputChange} required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Qty</label>
                <input 
                  type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
                <input 
                  type="number" name="reorder" value={formData.reorder} onChange={handleInputChange} required min="0"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-300"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Filter size={16} /> Filter
          </button>
          <select className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-4 py-2 transition-colors cursor-pointer outline-none">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Furniture</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-semibold">Product Details</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Category</th>
                <th className="px-6 py-4 font-semibold">Stock Status</th>
                <th className="px-6 py-4 font-semibold">Stock / Reorder</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{product.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 hidden md:table-cell">
                    {product.category}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      product.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      product.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {product.status === 'In Stock' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>}
                      {product.status === 'Low Stock' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>}
                      {product.status === 'Out of Stock' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>}
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${product.stock <= product.reorder ? 'text-rose-600' : 'text-slate-800'}`}>
                        {product.stock}
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-500">{product.reorder}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View details">
                        <Eye size={18} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit product">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                        title="Delete product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {/* Mobile fallback for actions */}
                    <button className="sm:hidden p-1.5 text-slate-400">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package size={48} className="text-slate-300 mb-4" />
                      <p className="text-lg font-medium text-slate-700">No products found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <p>Showing <span className="font-medium text-slate-800">1</span> to <span className="font-medium text-slate-800">{filteredProducts.length}</span> of <span className="font-medium text-slate-800">{products.length}</span> results</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Products;
