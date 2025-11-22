import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import bgVideo from '../assets/background.mp4';      // ⬅️ put your video here
import sideImage from '../assets/side-illustration.png';  // ⬅️ put your image here
import './Login.css'; // ⬅️ create this file

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData();
    formData.append('username', loginId);
    formData.append('password', password);

    try {
      const res = await axios.post('http://localhost:8000/auth/login', formData);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid Login Id or Password');
    }
  };

  return (
    <div className="login-page">
      {/* Background video */}
      <video 
        className="login-bg-video" 
        autoPlay 
        muted 
        loop 
        playsInline
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* Dark gradient overlay */}
      <div className="login-overlay" />

      {/* Centered card */}
      <div className="login-card">
        {/* Left half - image / branding */}
        <div className="login-card-left">
          <div className="login-left-content">
            <h1>StockOps</h1>
            <p>Smart. Fast. Precise inventory control for modern teams.</p>
            <img src={sideImage} alt="Inventory Illustration" className="login-side-image" />
          </div>
        </div>

        {/* Right half - form */}
        <div className="login-card-right">
          <div className="auth-box">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to continue</p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Login ID</label>
                <input 
                  type="text" 
                  placeholder="Enter Login ID" 
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="Enter Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>

              {error && (
                <p className="auth-error">
                  ⚠️ {error}
                </p>
              )}

              <button type="submit" className="auth-button">
                SIGN IN
              </button>
            </form>

            <div className="auth-footer">
              <span 
                className="auth-link" 
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
              <span className="auth-separator">|</span>
              <span 
                className="auth-link bold" 
                onClick={() => navigate('/register')}
              >
                Sign Up
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}