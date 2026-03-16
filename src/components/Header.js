import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserNotifications } from '../services/notificationService';

const Header = ({ onSignupClick, onAdminLoginClick }) => {
  const [menuActive, setMenuActive] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleToggle = () => {
    setMenuActive(!menuActive);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/');
      setMenuActive(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const closeMenu = () => {
    setMenuActive(false);
  };

  // Fetch unread notifications count
  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
    }
  }, [currentUser]);

  const fetchUnreadCount = async () => {
    try {
      const notifications = await getUserNotifications(currentUser.uid);
      const unread = notifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email || 'User';
  const isAdmin = userProfile?.role === 'admin';

  return (
    <header>
      <div id="navbar" className="obj-width">
        <Link to="/">
          <img className="logo" alt="Alacritas" src="/images/sourced/logo.png" />
        </Link>

        <ul id="menu" className={menuActive ? 'active' : ''}>
          <li>
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/jobs" onClick={closeMenu}>
              Jobs
            </Link>
          </li>
          <li>
            <Link to="/contact" onClick={closeMenu}>
              Contact
            </Link>
          </li>

          {currentUser && (
            <li style={{ position: 'relative' }}>
              <Link 
                to="/notifications" 
                onClick={closeMenu}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <i className="bx bxs-bell" style={{ fontSize: '1.3rem' }}></i>
                Notifications
                {unreadCount > 0 && (
                  <span 
                    style={{
                      backgroundColor: '#FF4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      marginLeft: '-0.3rem'
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </li>
          )}

          {currentUser && (
            <li>
              <Link 
                to="/my-requests" 
                onClick={closeMenu}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <i className="bx bxs-briefcase" style={{ fontSize: '1.3rem' }}></i>
                My Requests
              </Link>
            </li>
          )}

          {currentUser ? (
            <>
              <li>
                <Link 
                  to="/profile" 
                  onClick={closeMenu}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#07eea9'}
                  onMouseLeave={(e) => e.target.style.color = 'white'}
                >
                  <i className="bx bxs-user-circle" style={{ fontSize: '1.3rem' }}></i>
                  {displayName}
                </Link>
              </li>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="auth-btn"
                  style={{
                    backgroundColor: '#FFD700',
                    color: '#333',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                  onClick={closeMenu}
                  title="Access admin panel to manage jobs"
                >
                  Admin Panel
                </Link>
              )}
              <button 
                className="auth-btn" 
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Signing Out...' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <button
                id="signup-btn"
                className="auth-btn"
                onClick={() => {
                  onSignupClick();
                  closeMenu();
                }}
              >
                Sign Up
              </button>
              <Link to="/login" id="w-btn" onClick={closeMenu}>
                Sign In
              </Link>
            </>
          )}
        </ul>
        <i
          id="bar"
          className="bx bx-menu"
          onClick={handleToggle}
        ></i>
      </div>
    </header>
  );
};

export default Header;
