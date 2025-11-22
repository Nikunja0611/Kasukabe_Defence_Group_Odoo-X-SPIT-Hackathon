// File: Products.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: 'AeroGlide Pro Runner', sku: 'SKU-84593', category: 'Shoes', stock_quantity: 150, price: 129.99, status: 'in_stock' },
    { id: 2, name: 'ChronoSteel Watch', sku: 'SKU-10284', category: 'Accessories', stock_quantity: 45, price: 299.0, status: 'low_stock' },
    { id: 3, name: 'SoundWave Elite', sku: 'SKU-55432', category: 'Audio', stock_quantity: 0, price: 199.5, status: 'out_stock' },
    { id: 4, name: 'Nomad Leather Bag', sku: 'SKU-78901', category: 'Bags', stock_quantity: 80, price: 89.0, status: 'in_stock' },
    { id: 5, name: 'EchoBuds Wireless', sku: 'SKU-23456', category: 'Audio', stock_quantity: 200, price: 79.99, status: 'in_stock' },
  ]);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
  });

  const [query, setQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setProducts(res.data);
      }
    } catch (err) {
      console.log('Using dummy products data (API error)', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', form);
      await fetchProducts(); // refresh list from backend
    } catch (err) {
      console.error('Failed to create product, but adding locally for now', err);
      setProducts((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...form,
          stock_quantity: 0,
          status: 'in_stock',
        },
      ]);
    }

    setForm({ name: '', sku: '', category: '', price: '' });
    setShowAddForm(false);
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'in_stock') return <span className="badge stock">In Stock</span>;
    if (status === 'low_stock') return <span className="badge low">Low Stock</span>;
    return <span className="badge out">Out of Stock</span>;
  };

  return (
    <div className="p-wrap">
      {/* LIST VIEW */}
      {!showAddForm && (
        <div className="p-card">
          <div className="p-header">
            <div>
              <h1>Products</h1>
              <p className="sub">
                Manage your product inventory and view their sales performance.
              </p>
            </div>
            <button
              className="btn new"
              type="button"
              onClick={() => setShowAddForm(true)}
            >
              + Add New Product
            </button>
          </div>

          <div className="p-controls">
            <input
              className="search"
              placeholder="Search by product name or SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn filter" type="button">
              Filter
            </button>
            <button className="btn export" type="button">
              Export
            </button>
          </div>

          <div className="p-table-wrap">
            <table className="p-table">
              <thead>
                <tr>
                  <th>PRODUCT NAME</th>
                  <th>SKU</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>${p.price}</td>
                    <td>{p.stock_quantity}</td>
                    <td>{getStatusBadge(p.status)}</td>
                    <td className="actions">👁 ✏️ 🗑</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD PRODUCT VIEW */}
      {showAddForm && (
        <div className="p-card">
          <div className="p-header">
            <div>
              <h1>Add New Product</h1>
              <p className="sub">
                Create a new product with its basic details and pricing.
              </p>
            </div>
          </div>

          <form className="p-add-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Product Name</label>
              <input
                type="text"
                placeholder="e.g., Ergonomic Office Chair"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="field-group">
              <label>Category (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Furniture"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>SKU</label>
                <input
                  type="text"
                  placeholder="e.g., ECO-BLK-001"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  required
                />
              </div>
              <div className="field-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="$ e.g., 299.99"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="add-actions">
              <button
                type="button"
                className="btn export"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn new">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
