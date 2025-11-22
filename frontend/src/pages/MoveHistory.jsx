import React, { useEffect, useState } from 'react';
import api from '../api';

export default function MoveHistory() {
  const [moves, setMoves] = useState([]);

  useEffect(() => {
    api.get('/moves/history').then(res => setMoves(res.data));
  }, []);

  const getBadge = (type) => {
    if(type === 'receipt') return 'badge badge-receipt';
    if(type === 'delivery') return 'badge badge-delivery';
    return 'badge badge-internal';
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Stock Movement History</h2>
        <table>
          <thead>
            <tr>
              <th>Ref</th>
              <th>Product</th>
              <th>From</th>
              <th>To</th>
              <th>Qty</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {moves.map(m => (
              <tr key={m.id}>
                <td>#MV{m.id}</td>
                <td>Product ID: {m.product_id}</td> {/* In real app, join name */}
                <td>{m.source_id === 1 ? 'Vendor' : m.source_id === 2 ? 'Stock' : 'Customer'}</td>
                <td>{m.dest_id === 1 ? 'Vendor' : m.dest_id === 2 ? 'Stock' : 'Customer'}</td>
                <td>{m.qty}</td>
                <td><span className={getBadge(m.type)}>{m.type.toUpperCase()}</span></td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}