import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ name: '', sku: '', category: '', price: 0 });

    const fetchProducts = () => api.get('/products').then(res => setProducts(res.data));
    useEffect(() => { fetchProducts(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/products', form);
        fetchProducts();
        setForm({ name: '', sku: '', category: '', price: 0 });
    };

    return (
        <div>
            <h1>Product Management</h1>
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3>Add New Product</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                    <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    <input placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required />
                    <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                    <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                    <button type="submit">Create</button>
                </form>
            </div>

            <table>
                <thead>
                    <tr><th>Name</th><th>SKU</th><th>Category</th><th>Stock On Hand</th></tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.sku}</td>
                            <td>{p.category}</td>
                            <td><b>{p.stock_quantity}</b></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}