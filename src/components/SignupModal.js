import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignupModal = ({ isOpen, onClose, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    const fieldName = 
      id === 'signup-email' ? 'email' : 
      id === 'signup-password' ? 'password' : 
      id === 'confirm-password' ? 'confirmPassword' :
      id === 'terms' ? 'terms' :
      id;

    setFormData({
      ...formData,
      [fieldName]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Client-side validation
    if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage({
        text: 'Please fill in all fields',
        type: 'error'
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage({
        text: 'Please enter a valid email address',
        type: 'error'
      });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({
        text: 'Password must be at least 6 characters long',
        type: 'error'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({
        text: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    if (!formData.terms) {
      setMessage({
        text: 'Please agree to the Terms and Conditions',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting signup with:', formData.email);
      
      await signup(formData.email, formData.password, formData.displayName);
      
      setMessage({
        text: 'Account created successfully! Redirecting to home page...',
        type: 'success'
      });

      setTimeout(() => {
        onSignupSuccess();
        onClose();
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Signup failed:', error);
      setMessage({
        text: error.message || 'Failed to create account. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal show`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} disabled={loading}>&times;</button>
        <div className="modal-header">
          <img src="/images/sourced/logo.png" alt="Alacritas Logo" className="modal-logo" />
          <h2>Create Account</h2>
        </div>

        {message.text && (
          <div className={`signup-message show ${message.type}`} style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '0.95rem',
            wordBreak: 'break-word'
          }}>
            {message.text}
          </div>
        )}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Full Name</label>
            <input
              type="text"
              id="displayName"
              placeholder="Enter your full name"
              value={formData.displayName}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <i className="bx bx-user"></i>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              type="email"
              id="signup-email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <i className="bx bx-envelope"></i>
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              type="password"
              id="signup-password"
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <i className="bx bx-lock"></i>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <i className="bx bx-lock"></i>
          </div>

          <label className="terms-checkbox">
            <input
              type="checkbox"
              id="terms"
              checked={formData.terms}
              onChange={handleChange}
              disabled={loading}
              required
            />
            I agree to the Terms and Conditions
          </label>

          <button type="submit" className="signup-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-redirect">
          Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); onClose(); navigate('/login'); }}>Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
