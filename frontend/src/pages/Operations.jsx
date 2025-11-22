import React, { useState, useEffect } from 'react';
import api from '../api';

const styles = `
    .operations-container {
        padding: 24px;
        background: #f5f5f5;
        min-height: 100vh;
    }

    .operations-title {
        font-size: 32px;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 24px;
        text-align: center;
    }

    .card {
        background: white;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        max-width: 600px;
        margin: 0 auto;
        border: 1px solid #e0e0e0;
    }

    .tabs-container {
        display: flex;
        gap: 12px;
        margin-bottom: 28px;
        border-bottom: 2px solid #e0e0e0;
    }

    .tab {
        padding: 12px 20px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
        border-bottom: 3px solid transparent;
        margin-bottom: -2px;
    }

    .tab:hover {
        color: #7c3aed;
    }

    .tab.active {
        color: #7c3aed;
        border-bottom-color: #7c3aed;
    }

    .form-group {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
    }

    .form-label {
        font-size: 14px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .form-select,
    .form-input {
        padding: 12px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        transition: all 0.3s ease;
        background-color: #fafafa;
    }

    .form-select:hover,
    .form-input:hover {
        border-color: #d0d0d0;
        background-color: #ffffff;
    }

    .form-select:focus,
    .form-input:focus {
        outline: none;
        border-color: #7c3aed;
        background-color: #ffffff;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }

    .form-select {
        cursor: pointer;
        appearance: none;
        padding-right: 40px;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 10px center;
        background-size: 20px;
    }

    .btn-submit {
        padding: 12px 24px;
        background: #7c3aed;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
        margin-top: 8px;
    }

    .btn-submit:hover {
        background: #6d28d9;
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        transform: translateY(-1px);
    }

    .btn-submit:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
    }

    .message {
        margin-top: 20px;
        padding: 14px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        text-align: center;
        animation: slideIn 0.3s ease;
    }

    .message.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .message.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

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
        <>
            <style>{styles}</style>
            <div className="operations-container">
                <h1 className="operations-title">Operations Center</h1>
                <div className="card">
                    <div className="tabs-container">
                        <button 
                            className={`tab ${type === 'receipt' ? 'active' : ''}`}
                            onClick={() => setType('receipt')}
                        >
                            Receipt
                        </button>
                        <button 
                            className={`tab ${type === 'delivery' ? 'active' : ''}`}
                            onClick={() => setType('delivery')}
                        >
                            Delivery
                        </button>
                        <button 
                            className={`tab ${type === 'internal' ? 'active' : ''}`}
                            onClick={() => setType('internal')}
                        >
                            Internal Transfer
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Product</label>
                            <select className="form-select" onChange={e => setFormData({...formData, product_id: e.target.value})} required>
                                <option value="">Select Product...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Qty: {p.stock_quantity})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Quantity</label>
                            <input className="form-input" type="number" onChange={e => setFormData({...formData, qty: e.target.value})} required />
                        </div>
                        <button className="btn-submit" type="submit">Validate Operation</button>
                    </form>
                    {msg && <p className={`message ${msg.includes('Success') ? 'success' : 'error'}`}>{msg}</p>}
                </div>
            </div>
        </>
    );
}