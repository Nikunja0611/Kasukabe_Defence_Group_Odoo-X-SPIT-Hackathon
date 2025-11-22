import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP & New Pass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      // Sends request to backend to generate OTP
      const res = await axios.post('http://localhost:8000/auth/forgot-password', { email });
      
      // HACKATHON TRICK: The backend returns the OTP in the response for testing.
      // In a real app, this goes to email. We alert it here so you can copy it.
      alert(`OTP Sent: ${res.data.debug_otp}`); 
      
      setStep(2);
      setMsg('');
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Failed to send OTP'));
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    
    // Basic validation for new password
    if (newPassword.length < 6) {
      setMsg("Password too short (min 6 chars)");
      return;
    }

    try {
      await axios.post('http://localhost:8000/auth/reset-password', { 
        email, 
        otp, 
        new_password: newPassword 
      });
      alert('Password Reset Successful! Login with new password.');
      navigate('/login');
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Reset Failed'));
    }
  };

  return (
    <div className="auth-box">
      <div style={{marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', color: '#714B67'}}>
            Quantix IMS
      </div>
      <h3 style={{marginTop: 0}}>Reset Password</h3>
      
      {step === 1 ? (
        <form onSubmit={sendOtp}>
          <p style={{fontSize: '14px', color: '#666'}}>Enter your registered email to receive an OTP.</p>
          <input 
            type="email" 
            placeholder="Enter Email" 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{width: '100%', padding: '10px', marginBottom: '15px'}}
          />
          <button type="submit" style={{width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px'}}>
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword}>
          <p style={{fontSize: '14px', color: '#666'}}>OTP sent to {email}</p>
          <input 
            type="text" 
            placeholder="Enter 6-digit OTP" 
            onChange={e => setOtp(e.target.value)} 
            required 
            style={{width: '100%', padding: '10px', marginBottom: '15px'}}
          />
          <input 
            type="password" 
            placeholder="New Password" 
            onChange={e => setNewPassword(e.target.value)} 
            required 
            style={{width: '100%', padding: '10px', marginBottom: '15px'}}
          />
          <button type="submit" style={{width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px'}}>
            Reset Password
          </button>
        </form>
      )}

      {msg && <p style={{color: 'red', fontSize: '12px', marginTop:'10px'}}>{msg}</p>}
      
      <p style={{fontSize: '12px', marginTop: '20px'}}>
        <a href="/login" style={{color: '#333'}}>Back to Login</a>
      </p>
    </div>
  );
}