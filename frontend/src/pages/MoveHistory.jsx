// File: MoveHistory.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import './MoveHistory.css';

export default function MoveHistory() {
  const [moves, setMoves] = useState([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    let mounted = true;
    api.get('/moves/history')
      .then(res => {
        if (!mounted) return;
        // Accept non-empty arrays only — otherwise keep empty state
        if (Array.isArray(res.data) && res.data.length >= 0) {
          setMoves(res.data);
        }
      })
      .catch(err => {
        console.warn('Failed to fetch /moves/history', err);
      });
    return () => { mounted = false; };
  }, []);

  const getBadge = (type) => {
    if (type === 'receipt') return 'badge badge-receipt';
    if (type === 'delivery') return 'badge badge-delivery';
    return 'badge badge-internal';
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || 'draft';
    if (statusLower === 'done') return 'badge badge-status-done';
    if (statusLower === 'ready') return 'badge badge-status-ready';
    if (statusLower === 'waiting') return 'badge badge-status-waiting';
    if (statusLower === 'canceled') return 'badge badge-status-canceled';
    return 'badge badge-status-draft';
  };

  // search + filter + pagination
  const filtered = moves
    .filter(m => {
      if (typeFilter === 'All') return true;
      return (m.type || '').toLowerCase() === typeFilter.toLowerCase();
    })
    .filter(m => {
      if (!query) return true;
      const q = query.toLowerCase();
      const prod = (m.product?.name || `Product ID: ${m.product_id}`).toLowerCase();
      const src = (m.source?.name || String(m.source_id)).toLowerCase();
      const dst = (m.dest?.name || String(m.dest_id)).toLowerCase();
      return (`#MV${m.id}`.toLowerCase().includes(q) || prod.includes(q) || src.includes(q) || dst.includes(q));
    });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  return (
    <div className="mh-wrap">
      <div className="mh-card">
        <div className="mh-header">
          <div>
            <h1 className="mh-title">Stock Movement History</h1>
            <p className="mh-sub">Review and manage all past stock movements.</p>
          </div>

          <div className="mh-actions">
            <button className="btn export" onClick={() => {
              // simple client-side export (CSV)
              const rows = filtered.map(m => ({
                ref: `MV${m.id}`,
                product: m.product?.name || m.product_id,
                from: m.source?.name || m.source_id,
                to: m.dest?.name || m.dest_id,
                qty: m.qty,
                type: m.type,
                status: m.status,
                date: m.created_at
              }));
              const csv = [
                Object.keys(rows[0] || {}).join(','),
                ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'moves_history.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}>Export</button>

            <button className="btn new" onClick={() => { /* could open create modal */ }}>+ New Movement</button>
          </div>
        </div>

        <div className="mh-controls">
          <input
            className="mh-search"
            placeholder="Search by reference #, product or location..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
          />

          <div className="mh-filters">
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
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
                <th>PRODUCT</th>
                <th>FROM</th>
                <th>TO</th>
                <th>QTY</th>
                <th>TYPE</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr className="empty-row"><td colSpan="8">No movements found.</td></tr>
              )}
              {paged.map(m => (
                <tr key={m.id}>
                  <td className="mono">#MV{m.id}</td>
                  <td>{m.product?.name || `Product ID: ${m.product_id}`}</td>
                  <td>{m.source?.name || `Location ID: ${m.source_id}`}</td>
                  <td>{m.dest?.name || `Location ID: ${m.dest_id}`}</td>
                  <td>{m.qty}</td>
                  <td><span className={getBadge(m.type)}>{(m.type || '').toUpperCase()}</span></td>
                  <td><span className={getStatusBadge(m.status)}>{(m.status || 'DRAFT').toUpperCase()}</span></td>
                  <td>{m.created_at ? new Date(m.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mh-footer">
          <div>Showing {total === 0 ? 0 : (start + 1)} to {Math.min(start + perPage, total)} of {total} results</div>
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}>&lt;</button>
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              const pageNum = i + 1;
              return <button key={i} className={page === pageNum ? 'active' : ''} onClick={() => setPage(pageNum)}>{pageNum}</button>;
            })}
            {totalPages > 7 && <span className="dots">…</span>}
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}