import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobsContext';
import { useAuth } from '../context/AuthContext';
import { trackViewedJob } from '../services/userJobTrackingService';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJobById } = useJobs();
  const { currentUser } = useAuth();
  const job = getJobById(id);

  // Track viewed job
  useEffect(() => {
    if (currentUser && job) {
      trackViewedJob(currentUser.uid, id, job).catch(err => {
        console.error('Error tracking viewed job:', err);
      });
    }
  }, [id, currentUser, job]);

  if (!job) {
    return (
      <div className="extra-space obj-width">
        <h2>Job not found</h2>
      </div>
    );
  }

  const handleApplyClick = (e) => {
    e.preventDefault();
    // Navigate to the job application page
    navigate(`/apply/${id}`);
  };

  return (
    <div className="extra-space obj-width">
      <div className="job-header">
        <div className="job-img-row">
          <img src={job.image} alt={job.title} />
          <div>
            <h2>{job.title}</h2>
            <span>{job.type}</span>
          </div>
        </div>
        <button 
          id="g-btn" 
          onClick={handleApplyClick}
          style={{ border: 'none', cursor: 'pointer' }}
        >
          Apply Now
        </button>
      </div>

      <section className="job-details-info">
        <div className="info-box">
          <img src="/images/sourced/vacancy.png" alt="Vacancy Icon" />
          <h3>Vacancy</h3>
          <p>{job.vacancy || 'N/A'}</p>
        </div>
        <div className="info-box">
          <img src="/images/sourced/fe 1.png" alt="Position Icon" />
          <h3>Position</h3>
          <p>{job.title || 'N/A'}</p>
        </div>
        <div className="info-box">
          <img src="/images/sourced/hour.png" alt="Hours Icon" />
          <h3>Hours</h3>
          <p>{job.hours || 'Flexible'}</p>
        </div>
        <div className="info-box">
          <img src="/images/sourced/fe 2.png" alt="Workplace Icon" />
          <h3>Workplace</h3>
          <p>{job.workplace || 'N/A'}</p>
        </div>
        <div className="info-box">
          <img src="/images/sourced/fe 3.png" alt="Education Icon" />
          <h3>Education</h3>
          <p>{job.education || 'N/A'}</p>
        </div>
        <div className="info-box">
          <img src="/images/sourced/fe 4.png" alt="Experience Icon" />
          <h3>Experience</h3>
          <p>{job.experience || 'N/A'}</p>
        </div>
      </section>

      <section className="job-description">
        <h3>About this job</h3>
        <p>{job.description}</p>

        <h3 style={{ marginTop: '2rem' }}>Company</h3>
        <p>{job.companyName || 'N/A'}</p>

        <h3 style={{ marginTop: '2rem' }}>Location</h3>
        <p>{job.location || 'N/A'}</p>

        <h3 style={{ marginTop: '2rem' }}>Salary Range</h3>
        <p>{job.rate || 'N/A'}</p>

        {job.skills && job.skills.length > 0 && (
          <>
            <h3 style={{ marginTop: '2rem' }}>Required Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {job.skills.map((skill, idx) => (
                <span 
                  key={idx}
                  style={{
                    background: '#e8f1ff',
                    color: '#007bff',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      <div style={{ textAlign: 'center', margin: '3rem 0' }}>
        <button 
          id="g-btn" 
          onClick={handleApplyClick}
          style={{ border: 'none', cursor: 'pointer', display: 'inline-block' }}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobDetailsPage;
