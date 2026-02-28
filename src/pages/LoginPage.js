import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/validation';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [error, setError] = useState('');
  const { login, getSavedEmail, isSaveEmailChecked } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = getSavedEmail();
    const rememberMe = isSaveEmailChecked();

    if (rememberMe && savedEmail) {
      setFormData((prevState) => ({
        ...prevState,
        email: savedEmail,
        remember: true
      }));
    }
  }, [getSavedEmail, isSaveEmailChecked]);

  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const validation = validateLoginForm(formData.email, formData.password);

    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    try {
      login(formData.email, formData.password, formData.remember);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-box">
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
              />
              <i className="bx bx-lock"></i>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                Remember me
              </label>
              <a href="/" onClick={(e) => e.preventDefault()} className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-login">
            <a href="/" onClick={(e) => e.preventDefault()} className="social-btn google">
              <img src="/images/sourced/google.png" alt="Google" />
            </a>
            <a href="/" onClick={(e) => e.preventDefault()} className="social-btn facebook">
              <img src="/images/sourced/facebook.png" alt="Facebook" />
            </a>
            <a href="/" onClick={(e) => e.preventDefault()} className="social-btn linkedin">
              <img src="/images/sourced/linkedin.png" alt="LinkedIn" />
            </a>
          </div>

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
