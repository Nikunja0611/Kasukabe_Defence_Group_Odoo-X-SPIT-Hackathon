import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Operations from './pages/Operations';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <div className="sidebar">
                    <h2>StockMaster</h2>
                    <Link to="/">Dashboard</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/operations">Operations</Link>
                </div>
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/operations" element={<Operations />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;