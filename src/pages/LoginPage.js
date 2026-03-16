import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-box" style={{ position: 'relative' }}>
          <button 
            className="login-close-btn"
            onClick={() => navigate('/')}
            title="Close and go back"
            disabled={loading}
            type="button"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              fontSize: '2.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: loading ? '#ccc' : '#666',
              padding: '0',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.5 : 1
            }}
          >
            ×
          </button>
          
          <div className="login-header">
            <img src="/images/sourced/logo.png" alt="Alacritas Logo" className="login-logo" />
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>

          {error && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              background: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <i className="bx bx-envelope"></i>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <i className="bx bx-lock"></i>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="signup-link">
            Don't have an account? <Link to="/">Sign Up</Link>
          </div>
        </div>

        <div className="login-image">
          <img src="/images/sourced/hero2.png" alt="Login Illustration" />
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
