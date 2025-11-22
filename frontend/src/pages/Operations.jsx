import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Operations() {
    const [products, setProducts] = useState([]);
    const [type, setType] = useState('receipt'); // receipt, delivery, internal
    const [formData, setFormData] = useState({ product_id: '', qty: '' });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/products').then(res => setProducts(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');

        // Logic Mapped to Location IDs (Seeded in Backend)
        // 1: Vendor, 2: Stock, 3: Customer
        let source_id = 1; 
        let dest_id = 2;

        if (type === 'receipt') { source_id = 1; dest_id = 2; }
        if (type === 'delivery') { source_id = 2; dest_id = 3; }
        if (type === 'internal') { source_id = 2; dest_id = 2; } // Logic simplified for hackathon

        try {
            await api.post('/moves', {
                product_id: formData.product_id,
                qty: formData.qty,
                source_id,
                dest_id,
                type
            });
            setMsg('Operation Successful!');
        } catch (err) {
            setMsg('Error: ' + (err.response?.data?.detail || 'Failed'));
        }
    };

    return (
        <div>
            <h1>Operations Center</h1>
            <div className="card" style={{ maxWidth: '600px' }}>
                <div className="form-group">
                    <label>Operation Type</label>
                    <select value={type} onChange={e => setType(e.target.value)}>
                        <option value="receipt">Receipt (Vendor - Warehouse)</option>
                        <option value="delivery">Delivery (Warehouse -Customer)</option>
                        <option value="internal">Internal Transfer</option>
                    </select>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Product</label>
                        <select onChange={e => setFormData({...formData, product_id: e.target.value})} required>
                            <option value="">Select Product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Qty: {p.stock_quantity})</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Quantity</label>
                        <input type="number" onChange={e => setFormData({...formData, qty: e.target.value})} required />
                    </div>
                    <button type="submit">Validate Operation</button>
                </form>
                {msg && <p className="error" style={{color: msg.includes('Success') ? 'green' : 'red'}}>{msg}</p>}
            </div>
        </div>
    );
}