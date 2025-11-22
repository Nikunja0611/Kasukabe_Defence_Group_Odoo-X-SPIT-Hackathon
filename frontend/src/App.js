import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Operations from './pages/Operations';
import MoveHistory from './pages/MoveHistory';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword'; // <--- IMPORT THIS
import './App.css';

function Layout({ children }) {
  const location = useLocation();
  // Add '/forgot-password' to the list of auth pages so navbar hides
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthPage && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {!isAuthPage && (
        <nav className="navbar">
          <div className="nav-brand">StockOps</div>
          <div className="nav-links">
            <Link to="/">Overview</Link>
            <Link to="/operations">Operations</Link>
            <Link to="/history">History</Link>
            <Link to="/products">Products</Link>
          </div>
          <div className="nav-auth">
            <button onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
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
          {/* Auth Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* <--- ADD THIS ROUTE */}
          
          {/* Protected Routes */}
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