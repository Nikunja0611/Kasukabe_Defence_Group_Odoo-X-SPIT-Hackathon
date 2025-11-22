import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Operations from './pages/Operations';
import MoveHistory from './pages/MoveHistory';
import Login from './pages/Login';
import Register from './pages/Register'; // <--- IMPORT THIS
import './App.css';

// Layout Component to hide Navbar on Login/Register page
function Layout({ children }) {
  const location = useLocation();
  // Check if current path is login or register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAuthenticated = !!localStorage.getItem('token');

  // Protect Routes: If not logged in and not on an auth page, kick to login
  if (!isAuthPage && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {!isAuthPage && (
        <nav className="navbar">
          <div className="nav-brand">StockMaster</div>
          <div className="nav-links">
            <Link to="/">Overview</Link>
            <Link to="/operations">Operations</Link>
            <Link to="/history">History</Link>
            <Link to="/products">Products</Link>
          </div>
          <div className="nav-auth">
            <button onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}>LOGOUT</button>
          </div>
        </nav>
      )}
      <div className={!isAuthPage ? "container" : ""}>
        {children}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* <--- UPDATED ROUTE */}
          
          {/* Protected App Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/history" element={<MoveHistory />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;