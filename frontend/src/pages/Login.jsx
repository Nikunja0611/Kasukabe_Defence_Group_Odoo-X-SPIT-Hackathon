import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loginId, setLoginId] = useState(''); // Updated from email to loginId
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData();
    // Backend expects 'username', so we send loginId as 'username'
    formData.append('username', loginId);
    formData.append('password', password);

    try {
      const res = await axios.post('http://localhost:8000/auth/login', formData);
      
      // SAVE TOKEN AND ROLE
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role); 
      
      navigate('/'); // Redirect to Dashboard
    } catch (err) {
      // Show the specific error from backend (e.g., "Invalid Login Id or Password")
      setError(err.response?.data?.detail || 'Invalid Login Id or Password');
    }
  };

  return (
    <div className="auth-box">
      <div style={{marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', color: '#714B67'}}>
            Quantix IMS
      </div>
      <p>Sign in to continue</p>
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
            <label style={{textAlign:'left', display:'block', marginBottom:'5px'}}>Login Id</label>
            <input 
                type="text" 
                placeholder="Enter Login ID" 
                onChange={e => setLoginId(e.target.value)} 
                required 
                style={{width: '100%', padding: '10px', marginBottom: '15px'}}
            />
        </div>

        <div className="form-group">
            <label style={{textAlign:'left', display:'block', marginBottom:'5px'}}>Password</label>
            <input 
                type="password" 
                placeholder="Enter Password" 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{width: '100%', padding: '10px', marginBottom: '15px'}}
            />
        </div>

        {error && <p style={{color: 'red', fontSize: '13px', marginBottom: '10px'}}>⚠️ {error}</p>}

        <button type="submit" style={{width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
            SIGN IN
        </button>
      </form>

      <div style={{marginTop: '15px', fontSize: '14px'}}>
         <span style={{cursor: 'pointer', color: '#555'}} onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
         <span style={{margin: '0 5px'}}>|</span>
         <a href="/register" style={{fontWeight: 'bold', textDecoration: 'none', color: '#714B67'}}>Sign Up</a>
      </div>
    </div>
  );
}