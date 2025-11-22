import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=Email, 2=Verify OTP, 3=New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // Step 1: Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await axios.post('http://localhost:8000/auth/forgot-password', { email });
      alert(`OTP sent to ${email}. Check inbox.`);
      setStep(2);
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Failed to send OTP'));
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      // We use reset-password schema but send dummy password just for validation check
      await axios.post('http://localhost:8000/auth/verify-otp', { 
        email, 
        otp, 
        new_password: "dummy" // Ignored by verify-otp endpoint
      });
      setStep(3); // Move to Password Reset screen
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Invalid OTP'));
    }
  };

  // Step 3: Reset Password
  const resetPassword = async (e) => {
    e.preventDefault();
    setMsg('');

    if (newPassword !== confirmPassword) {
        setMsg("Passwords do not match!");
        return;
    }
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
      
      {/* STEP 1: EMAIL */}
      {step === 1 && (
        <form onSubmit={sendOtp}>
          <p style={{fontSize: '14px', color: '#666'}}>Enter your email to receive OTP.</p>
          <input 
            type="email" placeholder="Enter Email" 
            onChange={e => setEmail(e.target.value)} required 
            style={{width: '100%', padding: '10px', marginBottom: '15px'}}
          />
          <button type="submit" style={{width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px'}}>
            Send OTP
          </button>
        </form>
      )}

      {/* STEP 2: VERIFY OTP */}
      {step === 2 && (
        <form onSubmit={verifyOtp}>
          <p style={{fontSize: '14px', color: '#666'}}>OTP sent to <strong>{email}</strong></p>
          <input 
            type="text" placeholder="Enter 6-digit OTP" 
            onChange={e => setOtp(e.target.value)} required 
            style={{width: '100%', padding: '10px', marginBottom: '15px'}}
          />
          <button type="submit" style={{width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px'}}>
            Verify OTP
          </button>
        </form>
      )}

      {/* STEP 3: NEW PASSWORD */}
      {step === 3 && (
        <form onSubmit={resetPassword}>
          <p style={{fontSize: '14px', color: 'green'}}>OTP Verified! Set new password.</p>
          <input 
            type="password" placeholder="New Password" 
            onChange={e => setNewPassword(e.target.value)} required 
            style={{width: '100%', padding: '10px', marginBottom: '15px'}}
          />
          <input 
            type="password" placeholder="Confirm Password" 
            onChange={e => setConfirmPassword(e.target.value)} required 
            style={{width: '100%', padding: '10px', marginBottom: '15px'}}
          />
          <button type="submit" style={{width: '100%', padding: '10px', backgroundColor: '#017E84', color: 'white', border: 'none', borderRadius: '5px'}}>
            Update Password
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