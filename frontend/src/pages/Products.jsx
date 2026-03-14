import { useState } from 'react';

const Products = () => {
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: '', sku: '', category: 'Electronics', unit: '', warehouse: '', stock: '', reorder: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: products.length + 1,
      ...formData
    };
    setProducts([...products, newProduct]);
    setFormData({ name: '', sku: '', category: 'Electronics', unit: '', warehouse: '', stock: '', reorder: '' });
  };

  return (
    <div className="bg-white min-h-[calc(100vh-4rem)] p-8">
      <div className="w-full space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-full">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Product Name</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">SKU</label>
            <input 
              type="text" name="sku" value={formData.sku} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Category</label>
            <select 
              name="category" value={formData.category} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Raw Materials">Raw Materials</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Unit</label>
            <input 
              type="text" name="unit" value={formData.unit} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Warehouse</label>
            <input 
              type="text" name="warehouse" value={formData.warehouse} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Stock Quantity</label>
            <input 
              type="number" name="stock" value={formData.stock} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Reorder Level</label>
            <input 
              type="number" name="reorder" value={formData.reorder} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pb-4">
            <button 
              type="submit"
              className="bg-[#21314d] text-white px-5 py-2.5 rounded text-sm hover:bg-slate-800 transition-colors"
            >
              Save Product
            </button>
          </div>
        </form>

        <div className="overflow-x-auto border border-slate-200">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-[#21314d] text-white text-sm">
                <th className="px-4 py-3 font-medium border-r border-[#2d4061]">Product Name</th>
                <th className="px-4 py-3 font-medium border-r border-[#2d4061]">SKU</th>
                <th className="px-4 py-3 font-medium border-r border-[#2d4061]">Category</th>
                <th className="px-4 py-3 font-medium border-r border-[#2d4061]">Unit</th>
                <th className="px-4 py-3 font-medium border-r border-[#2d4061]">Warehouse</th>
                <th className="px-4 py-3 font-medium border-r border-[#2d4061]">Stock Quantity</th>
                <th className="px-4 py-3 font-medium border-r border-[#2d4061]">Reorder Level</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 border-r border-slate-200">{product.name}</td>
                  <td className="px-4 py-3 border-r border-slate-200">{product.sku}</td>
                  <td className="px-4 py-3 border-r border-slate-200">{product.category}</td>
                  <td className="px-4 py-3 border-r border-slate-200">{product.unit}</td>
                  <td className="px-4 py-3 border-r border-slate-200">{product.warehouse}</td>
                  <td className="px-4 py-3 border-r border-slate-200">{product.stock}</td>
                  <td className="px-4 py-3 border-r border-slate-200">{product.reorder}</td>
                  <td className="px-4 py-3 text-blue-600 cursor-pointer hover:underline">Edit</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-500 bg-slate-50">No products added yet. Fill out the form above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
