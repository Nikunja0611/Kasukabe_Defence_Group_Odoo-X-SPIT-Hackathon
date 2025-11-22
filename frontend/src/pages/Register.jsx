import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Register expects JSON body, not FormData
      await axios.post('http://localhost:8000/auth/register', {
        email: email,
        password: password
      });
      
      alert('Registration Successful! Please Login.');
      navigate('/login');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || 'Registration Failed'));
    }
  };

  return (
    <div className="auth-box">
      <h2 style={{color: '#714B67'}}>Create Account</h2>
      <p>Join StockMaster Team</p>
      <form onSubmit={handleRegister}>
        <input 
          type="email" 
          placeholder="Enter Email" 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Choose Password" 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" style={{backgroundColor: '#017E84'}}>Register Now</button>
      </form>
      <p style={{fontSize: '12px', marginTop: '20px'}}>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}