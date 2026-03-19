import { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  PackagePlus,
  PencilLine,
  Search,
  Tags,
  Trash2,
  Warehouse,
} from 'lucide-react';
import PageInfo from '../components/PageInfo';
import { api } from '../services/api';

const emptyForm = {
  name: '',
  sku: '',
  categoryId: '',
  categoryName: '',
  unit: 'units',
  reorderLevel: '10',
  price: '',
  initialQuantity: '',
  warehouseId: '',
  location: '',
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, warehousesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/warehouses'),
      ]);
      setProducts(productsRes?.data ?? []);
      setCategories(categoriesRes?.data ?? []);
      setWarehouses(warehousesRes?.data ?? []);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to load products.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return products;
    return products.filter((product) =>
      [product.name, product.sku, product.category_name, product.unit]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [products, query]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'categoryId' && value ? { categoryName: '' } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      unit: formData.unit.trim(),
      reorder_level: Number(formData.reorderLevel || 0),
      price: formData.price === '' ? null : Number(formData.price),
    };

    if (formData.categoryId) {
      payload.category_id = Number(formData.categoryId);
    } else if (formData.categoryName.trim()) {
      payload.category_name = formData.categoryName.trim();
    }

    if (!editingId) {
      payload.initial_quantity = Number(formData.initialQuantity || 0);
      if (formData.warehouseId) {
        payload.warehouse_id = Number(formData.warehouseId);
      }
      if (formData.location.trim()) {
        payload.location = formData.location.trim();
      }
    }

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setFeedback({ type: 'success', message: 'Product updated successfully.' });
      } else {
        await api.post('/products', payload);
        setFeedback({ type: 'success', message: 'Product saved to the database.' });
      }
      resetForm();
      await loadData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to save product.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name ?? '',
      sku: product.sku ?? '',
      categoryId: product.category_id ? String(product.category_id) : '',
      categoryName: '',
      unit: product.unit ?? 'units',
      reorderLevel: String(product.reorder_level ?? 10),
      price: product.price ?? '',
      initialQuantity: '',
      warehouseId: '',
      location: '',
    });
    setFeedback({ type: '', message: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId) => {
    setFeedback({ type: '', message: '' });
    try {
      await api.delete(`/products/${productId}`);
      setProducts((current) => current.filter((product) => product.id !== productId));
      if (editingId === productId) resetForm();
      setFeedback({ type: 'success', message: 'Product removed.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to delete product.' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageInfo
          title="What is the Products page?"
          description="Create products with database-backed stock metadata, then keep the catalog searchable across categories and warehouse operations."
          activities={[
            'Add name, SKU, category, unit of measure, price, and reorder level',
            'Capture opening stock against a warehouse when creating a new item',
            'Search the full catalog instantly on mobile or desktop',
            'Edit or remove incorrect entries without losing the rest of the list',
          ]}
        />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,360px),minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">
                  Product Setup
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                  {editingId ? 'Edit product' : 'Create a new product'}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Build directly against the database so every product entry is available across receipts,
                  deliveries, and stock alerts.
                </p>
              </div>
              <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
                {editingId ? <PencilLine size={22} /> : <PackagePlus size={22} />}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Product name</span>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                    placeholder="Industrial steel coils"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">SKU / code</span>
                  <input
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                    placeholder="STL-100"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Existing category</span>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                  >
                    <option value="">Choose category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Or create category</span>
                  <input
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleChange}
                    disabled={Boolean(formData.categoryId)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
                    placeholder="Raw Materials"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Unit</span>
                  <input
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                    placeholder="kg"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Reorder level</span>
                  <input
                    type="number"
                    min="0"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Unit price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                    placeholder="1250"
                  />
                </label>
              </div>

              {!editingId && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Warehouse size={16} />
                    Opening stock
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Optional, but useful when you want the first product entry to immediately affect inventory.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">Warehouse</span>
                      <select
                        name="warehouseId"
                        value={formData.warehouseId}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500"
                      >
                        <option value="">Select warehouse</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">Initial quantity</span>
                      <input
                        type="number"
                        min="0"
                        name="initialQuantity"
                        value={formData.initialQuantity}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500"
                        placeholder="100"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">Location</span>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500"
                        placeholder="Rack A-12"
                      />
                    </label>
                  </div>
                </div>
              )}

              {feedback.message && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    feedback.type === 'error'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {editingId ? <PencilLine size={16} /> : <PackagePlus size={16} />}
                  {saving ? 'Saving...' : editingId ? 'Update product' : 'Save product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Clear form
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Catalog</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Database-backed product list</h2>
              </div>
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, SKU, unit, or category"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Boxes size={16} />
                  Total products
                </div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">{products.length}</div>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                  <Tags size={16} />
                  Low stock items
                </div>
                <div className="mt-2 text-3xl font-semibold text-amber-900">
                  {products.filter((product) => (product.quantity ?? 0) <= (product.reorder_level ?? 0)).length}
                </div>
              </div>
              <div className="rounded-2xl bg-teal-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
                  <Warehouse size={16} />
                  Warehouses linked
                </div>
                <div className="mt-2 text-3xl font-semibold text-teal-900">{warehouses.length}</div>
              </div>
            </div>

            {loading ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                No products match your search yet.
              </div>
            ) : (
              <>
                <div className="mt-6 hidden overflow-hidden rounded-3xl border border-slate-200 xl:block">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-900 text-left text-sm text-white">
                      <tr>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Stock</th>
                        <th className="px-4 py-3 font-medium">Reorder</th>
                        <th className="px-4 py-3 font-medium">Price</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-500">{product.sku}</div>
                          </td>
                          <td className="px-4 py-4">{product.category_name || 'Uncategorized'}</td>
                          <td className="px-4 py-4">
                            {product.quantity} {product.unit}
                          </td>
                          <td className="px-4 py-4">{product.reorder_level}</td>
                          <td className="px-4 py-4">
                            {product.price == null ? '-' : `$${Number(product.price).toFixed(2)}`}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(product)}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(product.id)}
                                className="rounded-xl border border-rose-200 px-3 py-2 text-rose-700 transition hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid gap-4 xl:hidden">
                  {filteredProducts.map((product) => (
                    <article key={product.id} className="rounded-3xl border border-slate-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{product.sku}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {product.category_name || 'Uncategorized'}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <div className="text-slate-500">Quantity</div>
                          <div className="mt-1 font-semibold text-slate-900">
                            {product.quantity} {product.unit}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <div className="text-slate-500">Reorder</div>
                          <div className="mt-1 font-semibold text-slate-900">{product.reorder_level}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <div className="text-slate-500">Price</div>
                          <div className="mt-1 font-semibold text-slate-900">
                            {product.price == null ? '-' : `$${Number(product.price).toFixed(2)}`}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <div className="text-slate-500">Status</div>
                          <div className="mt-1 font-semibold text-slate-900">
                            {(product.quantity ?? 0) <= (product.reorder_level ?? 0) ? 'Low stock' : 'Healthy'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <PencilLine size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Products;
