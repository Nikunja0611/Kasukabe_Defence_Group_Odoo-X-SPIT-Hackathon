import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Operations() {
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [type, setType] = useState('receipt'); // receipt, delivery, internal, adjustment
    const [formData, setFormData] = useState({ product_id: '', qty: '' });
    const [adjustmentData, setAdjustmentData] = useState({ product_id: '', location_id: '', counted_qty: '', reason: '' });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/products').then(res => setProducts(res.data));
        api.get('/locations').then(res => setLocations(res.data));
    }, []);

    // Get current stock when product is selected for adjustment
    useEffect(() => {
        if (type === 'adjustment' && adjustmentData.product_id) {
            const product = products.find(p => p.id === parseInt(adjustmentData.product_id));
            setSelectedProduct(product);
        } else {
            setSelectedProduct(null);
        }
    }, [adjustmentData.product_id, type, products]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');

        // Handle adjustment separately
        if (type === 'adjustment') {
            try {
                const res = await api.post('/moves/adjustment', {
                    product_id: parseInt(adjustmentData.product_id),
                    location_id: parseInt(adjustmentData.location_id),
                    counted_qty: parseFloat(adjustmentData.counted_qty),
                    reason: adjustmentData.reason || null
                });
                setMsg(`Adjustment Successful! Difference: ${res.data.difference > 0 ? '+' : ''}${res.data.difference}. New Stock: ${res.data.new_stock}`);
                // Reset form
                setAdjustmentData({ product_id: '', location_id: '', counted_qty: '', reason: '' });
                // Refresh products to get updated stock
                api.get('/products').then(res => setProducts(res.data));
            } catch (err) {
                setMsg('Error: ' + (err.response?.data?.detail || 'Failed'));
            }
            return;
        }

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
            setFormData({ product_id: '', qty: '' });
            // Refresh products to get updated stock
            api.get('/products').then(res => setProducts(res.data));
        } catch (err) {
            setMsg('Error: ' + (err.response?.data?.detail || 'Failed'));
        }
    };

    // Calculate difference for adjustment
    const calculateDifference = () => {
        if (!selectedProduct || !adjustmentData.counted_qty) return null;
        const current = selectedProduct.stock_quantity || 0;
        const counted = parseFloat(adjustmentData.counted_qty) || 0;
        return counted - current;
    };

    return (
        <div>
            <h1>Operations Center</h1>
            <div className="card" style={{ maxWidth: '600px' }}>
                <div className="form-group">
                    <label>Operation Type</label>
                    <select value={type} onChange={e => setType(e.target.value)}>
                        <option value="receipt">Receipt (Vendor - Warehouse)</option>
                        <option value="delivery">Delivery (Warehouse - Customer)</option>
                        <option value="internal">Internal Transfer</option>
                        <option value="adjustment">Inventory Adjustment</option>
                    </select>
                </div>

                <form onSubmit={handleSubmit}>
                    {type === 'adjustment' ? (
                        <>
                            <div className="form-group">
                                <label>Product</label>
                                <select 
                                    value={adjustmentData.product_id} 
                                    onChange={e => setAdjustmentData({...adjustmentData, product_id: e.target.value})} 
                                    required
                                >
                                    <option value="">Select Product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Current: {p.stock_quantity})</option>)}
                                </select>
                            </div>
                            
                            {selectedProduct && (
                                <div style={{background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginBottom: '15px'}}>
                                    <strong>Current Stock:</strong> {selectedProduct.stock_quantity}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Location</label>
                                <select 
                                    value={adjustmentData.location_id} 
                                    onChange={e => setAdjustmentData({...adjustmentData, location_id: e.target.value})} 
                                    required
                                >
                                    <option value="">Select Location...</option>
                                    {locations.filter(loc => loc.type === 'internal').map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Counted Quantity</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={adjustmentData.counted_qty} 
                                    onChange={e => setAdjustmentData({...adjustmentData, counted_qty: e.target.value})} 
                                    required 
                                />
                            </div>

                            {selectedProduct && adjustmentData.counted_qty && (
                                <div style={{
                                    background: calculateDifference() >= 0 ? '#d4edda' : '#f8d7da',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    marginBottom: '15px',
                                    border: `1px solid ${calculateDifference() >= 0 ? '#c3e6cb' : '#f5c6cb'}`
                                }}>
                                    <strong>Difference:</strong> {calculateDifference() >= 0 ? '+' : ''}{calculateDifference()}
                                    <br />
                                    <small>{calculateDifference() >= 0 ? 'Stock will increase' : 'Stock will decrease'}</small>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Reason (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Physical count, Damage, etc."
                                    value={adjustmentData.reason} 
                                    onChange={e => setAdjustmentData({...adjustmentData, reason: e.target.value})} 
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Product</label>
                                <select 
                                    value={formData.product_id} 
                                    onChange={e => setFormData({...formData, product_id: e.target.value})} 
                                    required
                                >
                                    <option value="">Select Product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Qty: {p.stock_quantity})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input 
                                    type="number" 
                                    value={formData.qty} 
                                    onChange={e => setFormData({...formData, qty: e.target.value})} 
                                    required 
                                />
                            </div>
                        </>
                    )}
                    <button type="submit">Validate Operation</button>
                </form>
                {msg && <p className="error" style={{color: msg.includes('Success') ? 'green' : 'red'}}>{msg}</p>}
            </div>
        </div>
    );
}