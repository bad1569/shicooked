import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ onSignupClick }) => {
  const [menuActive, setMenuActive] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleToggle = () => {
    setMenuActive(!menuActive);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuActive(false);
  };

  const closeMenu = () => {
    setMenuActive(false);
  };

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
          <li>
            <Link to="/admin" onClick={closeMenu}>
              Admin
            </Link>
          </li>

          {currentUser ? (
            <>
              <li style={{ color: 'white', padding: '0 1rem' }}>
                Welcome, {currentUser}
              </li>
              <button className="auth-btn" onClick={handleLogout}>
                Logout
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
