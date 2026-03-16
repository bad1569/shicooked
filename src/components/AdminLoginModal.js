import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportUnauthorizedAccessAttempt } from '../utils/adminUtils';
import '../styles/adminLoginModal.css';

const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const { authenticateAsAdmin, currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setEmail('');
      setPassword('');
      setError('');
      
      // Check if user is logged in
      if (!currentUser) {
        setError('You must be logged in first. Please log in and try again.');
      }
    }
  }, [isOpen, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authenticateAsAdmin(email, password);
      
      // Clear failure count on success
      setFailureCount(0);
      
      // Show success message
      console.log(
        '%c✅ Admin login successful! Redirecting to admin panel...',
        'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;'
      );
      
      if (onSuccess) {
        setTimeout(onSuccess, 500);
      }
      onClose();
    } catch (err) {
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);
      setError(err.message || 'Admin authentication failed');
      
      // Report repeated failures
      reportUnauthorizedAccessAttempt(newFailureCount, email);
      
      console.error(
        '%c❌ Admin authentication failed',
        'background: #f44336; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        {
          attempt: newFailureCount,
          timestamp: new Date().toISOString(),
          error: err.message
        }
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <button className="admin-modal-close" onClick={onClose}>×</button>
        
        <h2 className="admin-modal-title">Admin Portal</h2>
        <p className="admin-modal-subtitle">Enter your admin credentials</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Admin Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="admin-error-message">
              <span>⚠️ {error}</span>
              {failureCount > 2 && (
                <small style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  Multiple failed attempts detected. Check browser console for details.
                </small>
              )}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading || !currentUser}
            title={!currentUser ? "You must be logged in first" : "Click to authenticate as admin"}
          >
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>

        <p className="admin-hint">
          🔒 This is a restricted area. Only authorized administrators can access this.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginModal;
