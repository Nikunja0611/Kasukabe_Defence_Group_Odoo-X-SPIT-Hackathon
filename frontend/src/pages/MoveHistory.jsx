import React, { useEffect, useState } from 'react';
import api from '../api';

export default function MoveHistory() {
  const [moves, setMoves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchMoves = () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (typeFilter !== 'all') params.type = typeFilter;
    
    api.get('/moves/history', { params })
      .then(res => setMoves(res.data))
      .catch(err => console.error('Failed to fetch moves', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMoves();
  }, [statusFilter, typeFilter]);

  const updateStatus = async (moveId, newStatus) => {
    try {
      await api.patch(`/moves/${moveId}/status`, { status: newStatus });
      fetchMoves(); // Refresh the list
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

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
        
        {/* Filter Tabs */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <strong style={{ marginRight: '10px' }}>Status:</strong>
            {['all', 'draft', 'waiting', 'ready', 'done', 'canceled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: statusFilter === status ? '#714B67' : 'white',
                  color: statusFilter === status ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginLeft: '20px' }}>
            <strong style={{ marginRight: '10px' }}>Type:</strong>
            {['all', 'receipt', 'delivery', 'internal', 'adjustment'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: typeFilter === type ? '#017E84' : 'white',
                  color: typeFilter === type ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading && <p style={{ textAlign: 'center', padding: '20px' }}>Loading...</p>}
        
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
              <th>Actions</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {moves.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                  No moves found
                </td>
              </tr>
            ) : (
              moves.map(m => {
                const currentStatus = m.status?.toLowerCase() || 'draft';
                return (
                  <tr key={m.id}>
                    <td>#MV{m.id}</td>
                    <td>{m.product?.name || `Product ID: ${m.product_id}`}</td>
                    <td>{m.source?.name || `Location ID: ${m.source_id}`}</td>
                    <td>{m.dest?.name || `Location ID: ${m.dest_id}`}</td>
                    <td>{m.qty}</td>
                    <td><span className={getBadge(m.type)}>{m.type.toUpperCase()}</span></td>
                    <td><span className={getStatusBadge(m.status)}>{m.status?.toUpperCase() || 'DRAFT'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {currentStatus === 'draft' && (
                          <button
                            onClick={() => updateStatus(m.id, 'ready')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              background: '#017E84',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            Mark Ready
                          </button>
                        )}
                        {(currentStatus === 'draft' || currentStatus === 'ready' || currentStatus === 'waiting') && (
                          <button
                            onClick={() => updateStatus(m.id, 'done')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              background: '#1E7E34',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            Mark Done
                          </button>
                        )}
                        {currentStatus !== 'done' && currentStatus !== 'canceled' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this move?')) {
                                updateStatus(m.id, 'canceled');
                              }
                            }}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              background: '#DC3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        {currentStatus === 'done' || currentStatus === 'canceled' ? (
                          <span style={{ color: '#999', fontSize: '11px' }}>No actions</span>
                        ) : null}
                      </div>
                    </td>
                    <td>{new Date(m.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}