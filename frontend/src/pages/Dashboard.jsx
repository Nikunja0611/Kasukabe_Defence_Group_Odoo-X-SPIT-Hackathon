import React, { useEffect, useState } from 'react';

// Mock API - replace with your actual API
const api = {
  get: async (url) => {
    return {
      data: {
        total_products: 1250,
        low_stock: 25,
        recent_moves: [
          { id: 1, type: 'in', qty: 50, status: 'completed' },
          { id: 2, type: 'out', qty: 30, status: 'pending' },
          { id: 3, type: 'in', qty: 100, status: 'completed' }
        ]
      }
    };
  }
};

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [logoUrl, setLogoUrl] = useState('/assets/logo.png');
  const [stats, setStats] = useState({ total_products: 0, low_stock: 0, recent_moves: [] });

  useEffect(() => {
    api.get('/dashboard').then(res => setStats(res.data));
  }, []);

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fa;
    }

    .container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .navbar {
      background: white;
      padding: 0 30px;
      height: 70px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 40px;
    }

    .navbar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: bold;
      color: #2c3e50;
    }

    .navbar-logo img {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: contain;
    }

    .navbar-menu {
      display: flex;
      gap: 30px;
    }

    .nav-item {
      padding: 8px 0;
      cursor: pointer;
      color: #666;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
      border-bottom: 2px solid transparent;
    }

    .nav-item:hover {
      color: #4a90e2;
    }

    .nav-item.active {
      color: #4a90e2;
      border-bottom-color: #4a90e2;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .add-btn {
      background: #4a90e2;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 13px;
    }

    .add-btn:hover {
      background: #3a7bc8;
    }

    .profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-left: 15px;
      border-left: 1px solid #e8eef5;
    }

    .profile-avatar {
      width: 36px;
      height: 36px;
      background: #ddd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .profile-info {
      font-size: 12px;
    }

    .profile-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .profile-role {
      color: #999;
      font-size: 11px;
    }

    .content {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }

    .header {
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 32px;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .header p {
      color: #999;
      font-size: 14px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    .card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .card-icon {
      width: 40px;
      height: 40px;
      background: #e8f0fe;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #4a90e2;
      font-weight: bold;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }

    .card-stat {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .card-stat-label {
      color: #666;
    }

    .card-stat-value {
      font-weight: 600;
      color: #2c3e50;
      font-size: 18px;
    }

    .card-stat-value.highlight {
      color: #4a90e2;
    }

    .card-stat-value.warning {
      color: #ffa500;
    }

    .card-links {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 20px;
      border-top: 1px solid #f0f0f0;
      padding-top: 20px;
    }

    .card-link {
      color: #4a90e2;
      text-decoration: none;
      font-size: 13px;
      cursor: pointer;
      transition: color 0.3s;
    }

    .card-link:hover {
      color: #2c5aa0;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .kpi-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }

    .kpi-card h3 {
      font-size: 12px;
      color: #999;
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }

    .kpi-card p {
      font-size: 36px;
      font-weight: bold;
      color: #2c3e50;
    }

    .table-section {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 25px;
    }

    .table-section h2 {
      font-size: 18px;
      color: #2c3e50;
      margin-bottom: 20px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    table thead {
      background: #f5f7fa;
    }

    table th {
      padding: 15px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: #666;
      border-bottom: 1px solid #e8eef5;
    }

    table td {
      padding: 15px;
      font-size: 14px;
      color: #2c3e50;
      border-bottom: 1px solid #e8eef5;
    }

    table tr:hover {
      background: #f9fafb;
    }

    table td:last-child {
      text-transform: capitalize;
    }
  `;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'operations', label: 'Operations' },
    { id: 'stock', label: 'Stock Move History' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="container">
      <style>{styles}</style>
      
      <div className="navbar">
        <div className="navbar-left">
          <div className="navbar-logo">
            <img src={logoUrl} alt="StockOps Logo" />
            StockOps
          </div>
          <div className="navbar-menu">
            {navItems.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="navbar-right">
          <button className="add-btn">+ Add New Product</button>
          <div className="profile">
            <div className="profile-avatar">A</div>
            <div className="profile-info">
              <div className="profile-name">Alex Chen</div>
              <div className="profile-role">Administrator</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="header">
          <h1>Overview</h1>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card" style={{borderLeftColor: '#714B67'}}>
            <h3>TOTAL PRODUCTS</h3>
            <p>{stats.total_products}</p>
          </div>
          <div className="kpi-card" style={{borderLeftColor: '#d9534f'}}>
            <h3>LOW STOCK ALERT</h3>
            <p>{stats.low_stock}</p>
          </div>
          <div className="kpi-card" style={{borderLeftColor: '#f0ad4e'}}>
            <h3>PENDING OPS</h3>
            <p>0</p>
          </div>
        </div>

        <div className="table-section">
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
      </div>
    </div>
  );
}