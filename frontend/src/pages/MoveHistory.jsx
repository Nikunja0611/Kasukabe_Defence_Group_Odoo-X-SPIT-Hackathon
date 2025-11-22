// File: MoveHistory.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import './MoveHistory.css';

export default function MoveHistory() {
  const [moves, setMoves] = useState([
    { id: 101, product_id: 1, product_name: 'Laptop', source_id: 1, dest_id: 2, type: 'receipt', qty: 10, created_at: '2025-01-10' },
    { id: 102, product_id: 2, product_name: 'Keyboard', source_id: 2, dest_id: 3, type: 'delivery', qty: 15, created_at: '2025-01-11' },
    { id: 103, product_id: 3, product_name: 'Mouse', source_id: 1, dest_id: 2, type: 'receipt', qty: 25, created_at: '2025-01-12' },
    { id: 104, product_id: 4, product_name: 'Chair', source_id: 2, dest_id: 3, type: 'delivery', qty: 5, created_at: '2025-01-13' },
    { id: 105, product_id: 5, product_name: 'Monitor', source_id: 3, dest_id: 2, type: 'internal', qty: 7, created_at: '2025-01-14' },
    { id: 106, product_id: 6, product_name: 'Printer', source_id: 1, dest_id: 2, type: 'receipt', qty: 3, created_at: '2025-01-15' },
    { id: 107, product_id: 7, product_name: 'Desk', source_id: 2, dest_id: 3, type: 'delivery', qty: 2, created_at: '2025-01-16' },
    { id: 108, product_id: 8, product_name: 'Headphones', source_id: 3, dest_id: 2, type: 'internal', qty: 20, created_at: '2025-01-17' },
    { id: 109, product_id: 9, product_name: 'USB Cable', source_id: 1, dest_id: 2, type: 'receipt', qty: 50, created_at: '2025-01-18' },
    { id: 110, product_id: 10, product_name: 'HDMI Cable', source_id: 2, dest_id: 3, type: 'delivery', qty: 30, created_at: '2025-01-19' },
    { id: 111, product_id: 11, product_name: 'Tablet', source_id: 3, dest_id: 2, type: 'internal', qty: 6, created_at: '2025-01-20' },
    { id: 112, product_id: 12, product_name: 'Smartphone', source_id: 1, dest_id: 2, type: 'receipt', qty: 12, created_at: '2025-01-21' },
    { id: 113, product_id: 13, product_name: 'Router', source_id: 2, dest_id: 3, type: 'delivery', qty: 4, created_at: '2025-01-22' },
    { id: 114, product_id: 14, product_name: 'SSD', source_id: 3, dest_id: 2, type: 'internal', qty: 18, created_at: '2025-01-23' },
    { id: 115, product_id: 15, product_name: 'Graphics Card', source_id: 1, dest_id: 2, type: 'receipt', qty: 8, created_at: '2025-01-24' },
]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    let mounted = true;
    api.get('/moves/history')
      .then(res => {
        // Only replace the local dummy data if the API returns a non-empty array
        if (mounted && Array.isArray(res.data) && res.data.length > 0) {
          setMoves(res.data);
        } else {
          // keep local dummy data (useful for development) and log what we received
          console.info('Moves API returned empty result — keeping local dummy data');
        }
      })
      .catch(err => {
        // Keep the dummy data on error instead of clearing it so the UI remains visible
        console.warn('Failed to fetch moves/history — keeping local dummy data', err);
      });
    return () => { mounted = false; };
  }, []);

  const getBadgeClass = (type) => {
    switch(type) {
      case 'receipt': return 'badge badge-receipt';
      case 'delivery': return 'badge badge-delivery';
      default: return 'badge badge-internal';
    }
  }

  // simple search + filter + pagination
  const filtered = moves
    .filter(m => statusFilter === 'All' ? true : (m.type === statusFilter))
    .filter(m => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (`#MV${m.id}`.toLowerCase().includes(q) ||
              (m.product_name || (`Product ID: ${m.product_id}`)).toLowerCase().includes(q) ||
              (m.source_name || String(m.source_id)).toLowerCase().includes(q) ||
              (m.dest_name || String(m.dest_id)).toLowerCase().includes(q)
      );
    });

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="mh-wrap">
      <div className="mh-card">
        <div className="mh-header">
          <div>
            <h1 className="mh-title">Stock Movement History</h1>
            <p className="mh-sub">Review and manage all past stock movements.</p>
          </div>
          <div className="mh-actions">
            <button className="btn export">Export</button>
            <button className="btn new">+ New Movement</button>
          </div>
        </div>

        <div className="mh-controls">
          <input
            className="mh-search"
            placeholder="Search by reference #, product or contact..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
          />

          <div className="mh-filters">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option>All</option>
              <option value="receipt">Receipt</option>
              <option value="delivery">Delivery</option>
              <option value="internal">Internal</option>
            </select>
          </div>
        </div>

        <div className="mh-table-wrap">
          <table className="mh-table">
            <thead>
              <tr>
                <th>REFERENCE #</th>
                <th>CREATION DATE</th>
                <th>PRODUCT</th>
                <th>FROM</th>
                <th>TO</th>
                <th>TYPE</th>
                <th>QTY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr className="empty-row"><td colSpan="8">No movements found.</td></tr>
              )}
              {paged.map(m => (
                <tr key={m.id}>
                  <td className="mono">#MV{m.id}</td>
                  <td>{new Date(m.created_at).toISOString().slice(0,10)}</td>
                  <td>{m.product_name || `Product ID: ${m.product_id}`}</td>
                  <td>{m.source_name || (m.source_id === 1 ? 'Vendor' : m.source_id === 2 ? 'Stock' : 'Customer')}</td>
                  <td>{m.dest_name || (m.dest_id === 1 ? 'Vendor' : m.dest_id === 2 ? 'Stock' : 'Customer')}</td>
                  <td><span className={getBadgeClass(m.type)}>{(m.type || '').toUpperCase()}</span></td>
                  <td>{m.qty}</td>
                  <td className="actions">⋯</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mh-footer">
          <div>Showing {start + 1} to {Math.min(start + perPage, total)} of {total} results</div>
          <div className="pagination">
            <button disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))}>&lt;</button>
            {[...Array(totalPages)].slice(0,5).map((_,i) => (
              <button key={i} className={page===i+1? 'active': ''} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            {totalPages > 5 && <span className="dots">…</span>}
            <button disabled={page===totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}


