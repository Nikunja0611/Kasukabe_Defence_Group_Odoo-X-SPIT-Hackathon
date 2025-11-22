import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Operations from './pages/Operations';
import MoveHistory from './pages/MoveHistory';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import './App.css';

function Layout({ children }) {
  const location = useLocation();

  // Pages that should NOT show navbar
  const isAuthPage = ['/login', '/register', '/forgot-password', '/'].includes(location.pathname);

  const isAuthenticated = !!localStorage.getItem('token');

  // Redirect unauthenticated users away from protected routes
  const protectedRoutes = ['/dashboard', '/operations', '/history', '/products'];
  if (protectedRoutes.includes(location.pathname) && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className={isAuthPage ? "auth-container" : "app-container"}>
      
      {/* Navbar visible for authenticated pages */}
      {!isAuthPage && (
        <nav className="navbar">
          <div className="navbar-left">
            <div className="nav-brand">StockOps</div>
            <div className="nav-links">

              <Link 
                to="/dashboard" 
                className={location.pathname === '/dashboard' ? 'active' : ''}
              >
                Dashboard
              </Link>

              <Link 
                to="/operations" 
                className={location.pathname === '/operations' ? 'active' : ''}
              >
                Operations
              </Link>

              <Link 
                to="/products" 
                className={location.pathname === '/products' ? 'active' : ''}
              >
                Stock
              </Link>

              <Link 
                to="/history" 
                className={location.pathname === '/history' ? 'active' : ''}
              >
                Move History
              </Link>

            </div>
          </div>

          <div className="navbar-right">
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                window.location.href = '/login';
              }}
            >
              LOGOUT
            </button>
          </div>
        </nav>
      )}

      <div className={!isAuthPage ? "main-content" : "auth-content"}>
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/products" element={<Products />} />
          <Route path="/history" element={<MoveHistory />} />

          {/* Optional fallback */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
