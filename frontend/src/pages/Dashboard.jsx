import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
    const [stats, setStats] = useState({ total_products: 0, low_stock: 0, recent_moves: [] });

    useEffect(() => {
        api.get('/dashboard').then(res => setStats(res.data));
    }, []);

    return (
        <div>
            <h1>Overview</h1>
            <div className="kpi-grid">
                <div className="card" style={{borderLeftColor: '#714B67'}}>
                    <h3>TOTAL PRODUCTS</h3>
                    <p>{stats.total_products}</p>
                </div>
                <div className="card" style={{borderLeftColor: '#d9534f'}}>
                    <h3>LOW STOCK ALERT</h3>
                    <p>{stats.low_stock}</p>
                </div>
                <div className="card" style={{borderLeftColor: '#f0ad4e'}}>
                    <h3>PENDING OPS</h3>
                    <p>0</p> {/* Placeholder for hackathon */}
                </div>
            </div>

            <h2>Recent Operations</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.recent_moves.map(m => (
                        <tr key={m.id}>
                            <td>{m.id}</td>
                            <td>{m.type.toUpperCase()}</td>
                            <td>{m.qty}</td>
                            <td>{m.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}