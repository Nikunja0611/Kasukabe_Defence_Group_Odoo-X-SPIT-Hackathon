import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    loginId: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff' // Default to Staff
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
    setError('');
  };

  const validate = () => {
    // 1. Login ID Validation
    if (form.loginId.length < 6 || form.loginId.length > 12) 
        return "Login ID must be between 6 and 12 characters.";
    
    // 2. Password Match
    if (form.password !== form.confirmPassword)
        return "Passwords do not match.";

    // 3. Strict Password Rules
    if (form.password.length <= 8) 
        return "Password must be more than 8 characters (min 9).";
    if (!/[A-Z]/.test(form.password)) 
        return "Password must contain at least one Uppercase letter (A-Z).";
    if (!/[a-z]/.test(form.password)) 
        return "Password must contain at least one Lowercase letter (a-z).";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) 
        return "Password must contain at least one Special character.";
    
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const validationError = validate();
    if (validationError) {
        setError(validationError);
        return;
    }

    try {
      // Send snake_case keys to backend
      await axios.post('http://localhost:8000/auth/register', {
        login_id: form.loginId,
        email: form.email,
        password: form.password,
        role: form.role 
      });
      
      alert('Registration Successful! Please Login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration Failed';
      setError(Array.isArray(msg) ? msg[0].msg : msg);
    }
  };

  return (
    <div className="auth-box">
        <div style={{marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', color: '#714B67'}}>
            Quantix IMS
        </div>

        <form onSubmit={handleRegister}>
            <div className="form-group">
                <label style={{textAlign: 'left', display:'block'}}>Role</label>
                <select name="role" onChange={handleChange} style={{width:'100%', padding: '8px', marginBottom:'10px'}}>
                    <option value="staff">Warehouse Staff (Picking/Packing)</option>
                    <option value="manager">Inventory Manager (Full Access)</option>
                </select>
            </div>

            <div className="form-group">
                <label style={{textAlign: 'left', display:'block'}}>Login Id (6-12 Chars)</label>
                <input name="loginId" onChange={handleChange} required style={{width:'100%', padding: '8px', marginBottom:'10px'}}/>
            </div>

            <div className="form-group">
                <label style={{textAlign: 'left', display:'block'}}>Email Id</label>
                <input name="email" type="email" onChange={handleChange} required style={{width:'100%', padding: '8px', marginBottom:'10px'}}/>
            </div>

            <div className="form-group">
                <label style={{textAlign: 'left', display:'block'}}>Password</label>
                <input name="password" type="password" onChange={handleChange} required style={{width:'100%', padding: '8px', marginBottom:'10px'}}/>
            </div>

            <div className="form-group">
                <label style={{textAlign: 'left', display:'block'}}>Re-Enter Password</label>
                <input name="confirmPassword" type="password" onChange={handleChange} required style={{width:'100%', padding: '8px', marginBottom:'10px'}}/>
            </div>

            {error && (
                <div style={{backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '15px'}}>
                    ⚠️ {error}
                </div>
            )}

            <button type="submit" style={{width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
                SIGN UP
            </button>
        </form>
        
        <p style={{fontSize: '12px', marginTop: '15px'}}>
            Already have an account? <a href="/login">Login</a>
        </p>
    </div>
  );
}