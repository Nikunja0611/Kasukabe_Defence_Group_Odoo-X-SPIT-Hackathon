import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Ensure this is your axios instance

export default function Dashboard() {
  // Initialize state matching the backend response structure
  const [stats, setStats] = useState({
    total_products: 0,
    low_stock: 0,
    low_stock_products: [],
    recent_moves: [],
    internal_transfers_scheduled: 0,
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

  const goToProducts = () => {
    navigate('/products');
  };

  const goToProductsLowStock = () => {
    // Navigate to products with low stock filter enabled
    navigate('/products', { state: { lowStockFilter: true } });
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

      {/* Low Stock Alerts Section */}
      {stats.low_stock_products && stats.low_stock_products.length > 0 && (
        <div style={{ 
          marginBottom: '30px',
          background: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
          border: '2px solid #f5c6cb',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '15px',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}></span>
            <h2 style={{ margin: 0, color: '#DC3545', fontSize: '20px' }}>Low Stock Alerts</h2>
            <span style={{ 
              background: '#DC3545', 
              color: 'white', 
              padding: '4px 12px', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {stats.low_stock_products.length} {stats.low_stock_products.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '15px' 
          }}>
            {stats.low_stock_products.map(product => (
              <div
                key={product.id}
                onClick={goToProducts}
                style={{
                  background: product.stock_quantity <= 3 ? '#fee' : '#fff8e1',
                  border: `2px solid ${product.stock_quantity <= 3 ? '#f5c6cb' : '#ffd54f'}`,
                  borderRadius: '8px',
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  fontSize: '28px',
                  color: product.stock_quantity <= 3 ? '#DC3545' : '#F0AD4E'
                }}>
                  
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: product.stock_quantity <= 3 ? '#DC3545' : '#856404',
                    fontSize: '14px',
                    marginBottom: '4px'
                  }}>
                    {product.name}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginBottom: '2px'
                  }}>
                    SKU: {product.sku}
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: product.stock_quantity <= 3 ? '#DC3545' : '#F0AD4E'
                  }}>
                    Qty: {product.stock_quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '15px', 
            textAlign: 'right' 
          }}>
            <button
              onClick={goToProducts}
              style={{
                background: '#DC3545',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              View All Products →
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Section */}
      <div className="ops-grid" style={{marginBottom: '30px'}}>
        {/* Products KPI Card */}
        <div className="ops-card" style={{borderLeftColor: '#714B67'}}>
          <div className="ops-title">Products</div>
          <div className="ops-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C3E50' }}>
                {stats.total_products || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Total Products</div>
            </div>
            <div className="ops-stats">
              {stats.low_stock > 0 ? (
                <span 
                  className="stat-item late" 
                  onClick={goToProductsLowStock}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {stats.low_stock} Low Stock
                </span>
              ) : (
                <span className="stat-item" style={{ color: '#1E7E34' }}>All Stock OK</span>
              )}
            </div>
          </div>
        </div>
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

      {/* Internal Transfers Card */}
      <div className="ops-grid" style={{marginBottom: '40px'}}>
        <div className="ops-card" style={{borderLeftColor: '#B7791F'}}>
          <div className="ops-title">Internal Transfers</div>
          <div className="ops-content">
            <button className="action-btn" onClick={() => goToOperations('internal')} style={{backgroundColor: '#B7791F'}}>
              {stats.internal_transfers_scheduled || 0} Scheduled
            </button>
            <div className="ops-stats">
              <span className="stat-item">Internal movements</span>
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
              <th>Product</th>
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
                    <td>{m.product?.name || `Product ID: ${m.product_id}`}</td>
                    <td><span className={getTypeBadge(m.type)}>{m.type}</span></td>
                    <td>{m.qty}</td>
                    <td><span className={`badge badge-status-${m.status?.toLowerCase() || 'draft'}`}>{m.status?.toUpperCase() || 'DRAFT'}</span></td>
                  </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#999'}}>
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