import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validateSignupForm } from '../utils/validation';
import { useNavigate } from 'react-router-dom';

const SignupModal = ({ isOpen, onClose, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    const fieldName = id === 'signup-email' ? 'email' : id === 'signup-password' ? 'password' : id === 'confirm-password' ? 'confirmPassword' : id;

    setFormData({
      ...formData,
      [fieldName]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateSignupForm(
      formData.username,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.terms
    );

    if (!validation.isValid) {
      setMessage({
        text: validation.errors[0],
        type: 'error'
      });
      return;
    }

    try {
      signup(formData.username, formData.email, formData.password);
      setMessage({
        text: 'Account created successfully! Redirecting to home page...',
        type: 'success'
      });

      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
      });

      setTimeout(() => {
        onSignupSuccess();
        onClose();
        navigate('/');
      }, 2000);
    } catch (error) {
      setMessage({
        text: error.message,
        type: 'error'
      });
    }
  };

  return (
    <div className={`modal ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>&times;</button>
        <div className="modal-header">
          <img src="/images/sourced/logo.png" alt="Alacritas Logo" className="modal-logo" />
          <h2>Create Account</h2>
        </div>

        {message.text && (
          <div className={`signup-message show ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
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
              required
            />
            <i className="bx bx-envelope"></i>
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              type="password"
              id="signup-password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
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
              required
            />
            I agree to the Terms and Conditions
          </label>

          <button type="submit" className="signup-submit-btn">
            Create Account
          </button>
        </form>

        <div className="login-redirect">
          Already have an account? <a href="/login" onClick={onClose}>Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
