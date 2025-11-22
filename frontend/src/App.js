import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products'; // This corresponds to "Stock" in your navbar
import Operations from './pages/Operations';
import MoveHistory from './pages/MoveHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings'; 
import './App.css'; // Ensure your styles are imported

function Layout({ children }) {
  const location = useLocation();
  // Define public pages that do NOT need the Navbar
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  
  // Check Authentication Status
  const isAuthenticated = !!localStorage.getItem('token');

  // SECURITY: Redirect unauthenticated users to Login
  if (!isAuthPage && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect logged-in users away from Auth pages
  if (isAuthPage && isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className={isAuthPage ? "auth-container" : "app-container"}>
      {/* Show Navbar only inside the protected app */}
      {!isAuthPage && (
        <nav className="navbar">
          <div className="navbar-left">
            <div className="nav-brand">StockOps</div>
            <div className="nav-links">
              {/* Navigation Links Matching Your Wireframe */}
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
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
              
              <Link 
                to="/settings" 
                className={location.pathname === '/settings' ? 'active' : ''}
              >
                Settings
              </Link>
            </div>
          </div>
          
          <div className="navbar-right">
            <button className="logout-btn" onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              window.location.href = '/login';
            }}>LOGOUT</button>
          </div>
        </nav>
      )}
      
      {/* Main Content Area */}
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
          {/* --- Auth Routes --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* --- Protected Routes (Your Functional Pages) --- */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/products" element={<Products />} /> {/* "Stock" Link goes here */}
          <Route path="/history" element={<MoveHistory />} />
          
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;