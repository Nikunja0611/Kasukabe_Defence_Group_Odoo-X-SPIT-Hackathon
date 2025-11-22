import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

export default function Products() {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // Store all products for category list
    const [form, setForm] = useState({ name: '', sku: '', category: '', price: 0 });
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', sku: '', category: '', price: 0 });
    const [userRole, setUserRole] = useState('staff');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [lowStockFilter, setLowStockFilter] = useState(location.state?.lowStockFilter || false);

    useEffect(() => {
        const role = localStorage.getItem('role') || 'staff';
        setUserRole(role);
    }, []);

    const fetchProducts = () => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (categoryFilter !== 'all') params.category = categoryFilter;
        if (lowStockFilter) params.low_stock = true;
        
        api.get('/products', { params })
            .then(res => {
                setProducts(res.data);
            });
    };
    
    // Fetch all products once to get categories
    useEffect(() => {
        api.get('/products').then(res => setAllProducts(res.data));
    }, []);
    
    useEffect(() => { fetchProducts(); }, [searchTerm, categoryFilter, lowStockFilter]);
    
    // Get unique categories
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/products', form);
        fetchProducts();
        setForm({ name: '', sku: '', category: '', price: 0 });
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            sku: product.sku,
            category: product.category || '',
            price: product.price || 0
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/products/${editingProduct.id}`, editForm);
            fetchProducts();
            setEditingProduct(null);
            setEditForm({ name: '', sku: '', category: '', price: 0 });
        } catch (err) {
            alert('Error updating product: ' + (err.response?.data?.detail || 'Failed'));
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }
        try {
            await api.delete(`/products/${productId}`);
            fetchProducts();
        } catch (err) {
            alert('Error deleting product: ' + (err.response?.data?.detail || 'Failed'));
        }
    };

    const isManager = userRole === 'manager';

    return (
        <div>
            <h1>Product Management</h1>
            
            {/* Add New Product Form - Only for Managers */}
            {isManager && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3>Add New Product</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input 
                            placeholder="Name" 
                            value={form.name} 
                            onChange={e => setForm({...form, name: e.target.value})} 
                            required 
                            style={{ flex: '1 1 200px' }}
                        />
                        <input 
                            placeholder="SKU" 
                            value={form.sku} 
                            onChange={e => setForm({...form, sku: e.target.value})} 
                            required 
                            style={{ flex: '1 1 150px' }}
                        />
                        <input 
                            placeholder="Category" 
                            value={form.category} 
                            onChange={e => setForm({...form, category: e.target.value})} 
                            style={{ flex: '1 1 150px' }}
                        />
                        <input 
                            type="number" 
                            step="0.01"
                            placeholder="Price" 
                            value={form.price} 
                            onChange={e => setForm({...form, price: e.target.value})} 
                            style={{ flex: '1 1 120px' }}
                        />
                        <button type="submit" style={{ flex: '0 0 auto' }}>Create</button>
                    </form>
                </div>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%', position: 'relative' }}>
                        <button
                            onClick={() => setEditingProduct(null)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#666'
                            }}
                        >
                            ×
                        </button>
                        <h3>Edit Product</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Name</label>
                                <input 
                                    value={editForm.name} 
                                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>SKU</label>
                                <input 
                                    value={editForm.sku} 
                                    onChange={e => setEditForm({...editForm, sku: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input 
                                    value={editForm.category} 
                                    onChange={e => setEditForm({...editForm, category: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Price</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={editForm.price} 
                                    onChange={e => setEditForm({...editForm, price: e.target.value})} 
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" style={{ flex: 1 }}>Update Product</button>
                                <button 
                                    type="button" 
                                    onClick={() => setEditingProduct(null)}
                                    style={{ flex: 1, background: '#ccc' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Filters</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search Bar */}
                    <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    
                    {/* Category Filter */}
                    <div style={{ flex: '0 1 200px' }}>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Low Stock Toggle */}
                    <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            id="lowStockFilter"
                            checked={lowStockFilter}
                            onChange={e => setLowStockFilter(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="lowStockFilter" style={{ cursor: 'pointer', fontSize: '14px' }}>
                            Low Stock Only (&lt; 10)
                        </label>
                    </div>
                    
                    {/* Clear Filters */}
                    {(searchTerm || categoryFilter !== 'all' || lowStockFilter) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setCategoryFilter('all');
                                setLowStockFilter(false);
                            }}
                            style={{
                                padding: '10px 16px',
                                background: '#ccc',
                                color: '#333',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock On Hand</th>
                            {isManager && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={isManager ? 6 : 5} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                    No products found
                                </td>
                            </tr>
                        ) : (
                            products.map(p => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{p.sku}</td>
                                    <td>{p.category || '-'}</td>
                                    <td>${p.price?.toFixed(2) || '0.00'}</td>
                                    <td><b>{p.stock_quantity}</b></td>
                                    {isManager && (
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#017E84',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#DC3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}