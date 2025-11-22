import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const res = await axios.post('http://localhost:8000/auth/login', formData);
      localStorage.setItem('token', res.data.access_token);
      navigate('/'); // Redirect to Dashboard
    } catch (err) {
      alert('Invalid Credentials');
    }
  };

  return (
    <div className="auth-box">
      <h2 style={{color: '#714B67'}}>StockMaster</h2>
      <p>Sign in to continue</p>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <p style={{fontSize: '12px', marginTop: '20px'}}>
        Don't have an account? <a href="/register">Sign Up</a>
      </p>
    </div>
  );
}