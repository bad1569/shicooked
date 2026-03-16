import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="obj-width">
        <div className="top">
          <div>
            <img src="/images/sourced/logo.png" alt="Alacritas Logo" />
            <p>Find your desired job with us</p>
          </div>
          <div>
            <Link to="/">
              <i className="bx bxl-facebook-square"></i>Home
            </Link>
            <Link to="/jobs">
              <i className="bx bxl-facebook-square"></i>Jobs
            </Link>
            <Link to="/contact">
              <i className="bx bxl-facebook-square"></i>Contact
            </Link>
            <Link to="/admin">
              <i className="bx bxl-facebook-square"></i>Admin
            </Link>
          </div>
          <div>
            <a href="/" onClick={(e) => e.preventDefault()}>
              <i className="bx bxl-facebook-square"></i>
            </a>
            <a href="/" onClick={(e) => e.preventDefault()}>
              <i className="bx bxl-twitter-square"></i>
            </a>
            <a href="/" onClick={(e) => e.preventDefault()}>
              <i className="bx bxl-linkedin-square"></i>
            </a>
          </div>
        </div>
        <h3>Alacritas</h3>
        <p>Unit 206, Tech Tower Manila<br />Makati, Metro Manila, Philippines</p>
        <p>Email: info@alacritas.com</p>
      </div>
    </footer>
  );
};

export default Footer;
