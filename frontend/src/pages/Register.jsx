import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import bgVideo from '../assets/background.mp4'; // ensure file exists at frontend/src/assets/background.mp4
import sideIllustration from '../assets/side-illustration.png'; // ensure file exists at frontend/src/assets/side-illustration.png
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({
    loginId: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    // Debug: show resolved import URLs in console
    console.log('Resolved bgVideo ->', bgVideo);
    console.log('Resolved sideIllustration ->', sideIllustration);

    const vid = videoRef.current;
    if (!vid) return;

    const onLoaded = () => {
      console.log('Video loadeddata');
      // add fade-in class after metadata loaded
      vid.classList.add('fade-in');
    };
    const onPlaying = () => console.log('Video playing');
    const onError = (e) => console.error('Video error', e);

    vid.addEventListener('loadeddata', onLoaded);
    vid.addEventListener('playing', onPlaying);
    vid.addEventListener('error', onError);

    return () => {
      vid.removeEventListener('loadeddata', onLoaded);
      vid.removeEventListener('playing', onPlaying);
      vid.removeEventListener('error', onError);
    };
  }, []);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
    setError('');
  };

  const validate = () => {
    if (form.loginId.length < 6 || form.loginId.length > 12) 
        return "Login ID must be between 6 and 12 characters.";
    if (form.password !== form.confirmPassword)
        return "Passwords do not match.";
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
    <div className="register-page">
      {/* Bundler import approach: src/assets/background.mp4 */}
      <video
        ref={videoRef}
        className="register-bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="register-card" role="main" aria-label="Register card">
        <div className="register-card-left" aria-hidden="false">
          <div className="register-left-content">
            <h1>Stockops</h1>
            <p>Smart. Fast. Precise inventory control for modern teams.</p>

            <div className="illustration-wrap">
              <img
                src={sideIllustration}
                alt="illustration"
                className="illustration-img"
              />
            </div>
          </div>
        </div>

        <div className="register-card-right">
          <div className="register-auth-box" role="form">
            <div className="register-title">Create Account</div>

            <form onSubmit={handleRegister} className="register-form" noValidate>
                <div className="form-group">
                    <label>Role</label>
                    <select name="role" value={form.role} onChange={handleChange} className="form-select">
                        <option value="staff">Warehouse Staff (Picking/Packing)</option>
                        <option value="manager">Inventory Manager (Full Access)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Login Id (6-12 Chars)</label>
                    <input name="loginId" value={form.loginId} onChange={handleChange} required className="form-input" placeholder="Enter login id"/>
                </div>

                <div className="form-group">
                    <label>Email Id</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required className="form-input" placeholder="Enter email"/>
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} required className="form-input" placeholder="Enter password"/>
                </div>

                <div className="form-group">
                    <label>Re-Enter Password</label>
                    <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required className="form-input" placeholder="Re-enter password"/>
                </div>

                {error && (
                    <div className="error-box" role="alert">⚠️ {error}</div>
                )}

                <button type="submit" className="submit-button">SIGN UP</button>
            </form>

            <p className="small-note">
              Already have an account? <a href="/login">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
