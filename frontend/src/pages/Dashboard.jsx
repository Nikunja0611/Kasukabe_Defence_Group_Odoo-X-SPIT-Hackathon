import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Ensure this is your axios instance

export default function Dashboard() {
  // Initialize state matching the backend response structure
  const [stats, setStats] = useState({
    total_products: 0,
    low_stock: 0,
    recent_moves: [],
    receipts: { to_process: 0, late: 0, total: 0 },
    deliveries: { to_process: 0, late: 0, waiting: 0, total: 0 }
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch real data from backend
    api.get('/dashboard')
      .then(res => {
        setStats(res.data);
      })
      .catch(err => console.error("Failed to fetch dashboard data", err));
  }, []);

  const goToOperations = (type) => {
    // Navigate to operations page, ideally with a filter state
    navigate('/operations', { state: { type } });
  };

  // Helper to style operation types badges
  const getTypeBadge = (type) => {
      if(type === 'receipt' || type === 'in') return 'badge badge-in';
      if(type === 'delivery' || type === 'out') return 'badge badge-out';
      return 'badge badge-internal';
  };

  // Internal styles for Dashboard specific components
  const styles = `
    .dashboard-container { padding-top: 10px; }
    .header { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 32px; color: #2c3e50; margin: 0; font-weight: 800; }
    
    /* Operational Cards Grid */
    .ops-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); 
      gap: 30px; 
      margin-bottom: 40px; 
    }

    .ops-card { 
      background: white; 
      padding: 30px; 
      border-radius: 12px; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 200px;
      border-left: 6px solid #714B67; /* Odoo Purple default */
      transition: transform 0.2s ease;
    }
    
    .ops-card:hover { transform: translateY(-5px); }
    .ops-card.delivery { border-left-color: #017E84; /* Teal */ }

    .ops-title { 
      font-size: 24px; 
      font-weight: 700; 
      color: #2C3E50; 
      margin-bottom: 20px; 
    }

    .ops-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .action-btn {
      background-color: #714B67;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(113, 75, 103, 0.3);
      transition: background 0.2s;
    }
    .ops-card.delivery .action-btn { background-color: #017E84; box-shadow: 0 4px 6px rgba(1, 126, 132, 0.3); }
    .action-btn:hover { opacity: 0.9; }

    .ops-stats {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-item {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    .stat-item.late { color: #DC3545; font-weight: 700; }
    .stat-item.waiting { color: #F0AD4E; }

    /* Table Section */
    .table-section { background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 30px; }
    .table-section h2 { font-size: 20px; color: #2c3e50; margin-bottom: 25px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; }
    
    /* Badges */
    .badge { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-in { background: #E6F4EA; color: #1E7E34; }
    .badge-out { background: #FEECED; color: #DC3545; }
    .badge-internal { background: #FFF8E1; color: #B7791F; }
  `;

  return (
    <div className="dashboard-container">
      <style>{styles}</style>

      <div className="header">
        <h1>Dashboard</h1>
      </div>

      {/* Operational Cards Section */}
      <div className="ops-grid">
        
        {/* Receipt Card */}
        <div className="ops-card receipt">
          <div className="ops-title">Receipts</div>
          <div className="ops-content">
            <button className="action-btn" onClick={() => goToOperations('receipt')}>
              {stats.receipts?.to_process || 0} To Receive
            </button>
            <div className="ops-stats">
              {stats.receipts?.late > 0 && (
                <span className="stat-item late">{stats.receipts.late} Late</span>
              )}
              <span className="stat-item">{stats.receipts?.total || 0} Operations</span>
            </div>
          </div>
        </div>

        {/* Delivery Card */}
        <div className="ops-card delivery">
          <div className="ops-title">Delivery Orders</div>
          <div className="ops-content">
            <button className="action-btn" onClick={() => goToOperations('delivery')}>
              {stats.deliveries?.to_process || 0} To Deliver
            </button>
            <div className="ops-stats">
              {stats.deliveries?.late > 0 && (
                <span className="stat-item late">{stats.deliveries.late} Late</span>
              )}
              {stats.deliveries?.waiting > 0 && (
                <span className="stat-item waiting">{stats.deliveries.waiting} Waiting</span>
              )}
              <span className="stat-item">{stats.deliveries?.total || 0} Operations</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Moves Table */}
      <div className="table-section">
        <h2>Recent Stock Moves</h2>
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent_moves && stats.recent_moves.length > 0 ? (
                stats.recent_moves.map(m => (
                  <tr key={m.id}>
                    <td>MV-{m.id.toString().padStart(4, '0')}</td>
                    <td><span className={getTypeBadge(m.type)}>{m.type}</span></td>
                    <td>{m.qty}</td>
                    <td>{m.status}</td>
                  </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#999'}}>
                        No recent operations found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}