import React from 'react';
import { useAuth } from '../context/AuthContext';

const Team = ({ onJobRequestClick }) => {
  const { currentUser } = useAuth();

  return (
    <section className="team sec-space obj-width">
      <h2>Post a Job Request</h2>
      <p>Need custom work done? Post your job request and let skilled professionals bid for it.</p>

      <div className="job-request-section">
        <div className="request-benefits">
          <div className="benefit-card">
            <div className="benefit-icon"><i className="bx bxs-target-lock"></i></div>
            <h3>Custom Work</h3>
            <p>Describe exactly what you need, from simple repairs to large projects</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon"><i className="bx bxs-map"></i></div>
            <h3>Location-Based Pricing</h3>
            <p>Transparent pricing based on your location in Luzon and skill level</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon"><i className="bx bxs-hourglass"></i></div>
            <h3>Flexible Timeline</h3>
            <p>Set your own timeframe for project completion</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon"><i className="bx bxs-user-badge"></i></div>
            <h3>Expert Workers</h3>
            <p>Connect with laborers, skilled workers, and specialists</p>
          </div>
        </div>

        {currentUser ? (
          <button 
            className="btn-post-request" 
            onClick={onJobRequestClick}
          >
            Post a Job Request
          </button>
        ) : (
          <div className="auth-prompt">
            <p>Sign in to post a job request</p>
            <a href="/login" className="btn-post-request">
              Sign In & Post Request
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Team;
