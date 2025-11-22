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

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || 'draft';
    if(statusLower === 'done') return 'badge badge-status-done';
    if(statusLower === 'ready') return 'badge badge-status-ready';
    if(statusLower === 'waiting') return 'badge badge-status-waiting';
    if(statusLower === 'canceled') return 'badge badge-status-canceled';
    return 'badge badge-status-draft';
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
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {moves.map(m => (
              <tr key={m.id}>
                <td>#MV{m.id}</td>
                <td>{m.product?.name || `Product ID: ${m.product_id}`}</td>
                <td>{m.source?.name || `Location ID: ${m.source_id}`}</td>
                <td>{m.dest?.name || `Location ID: ${m.dest_id}`}</td>
                <td>{m.qty}</td>
                <td><span className={getBadge(m.type)}>{m.type.toUpperCase()}</span></td>
                <td><span className={getStatusBadge(m.status)}>{m.status?.toUpperCase() || 'DRAFT'}</span></td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}