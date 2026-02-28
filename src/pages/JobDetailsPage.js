import React from 'react';
import { useParams } from 'react-router-dom';
import { useJobs } from '../context/JobsContext';

const JobDetailsPage = () => {
  const { id } = useParams();
  const { getJobById } = useJobs();
  const job = getJobById(id);

  if (!job) {
    return (
      <div className="extra-space obj-width">
        <h2>Job not found</h2>
      </div>
    );
  }

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
        <a id="g-btn" href="/" onClick={(e) => e.preventDefault()}>
          Apply Now
        </a>
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
      </section>

      <div style={{ textAlign: 'center', margin: '3rem 0' }}>
        <a id="g-btn" href="/" onClick={(e) => e.preventDefault()} style={{ display: 'inline-block' }}>
          Apply Now
        </a>
      </div>
    </div>
  );
};

export default JobDetailsPage;
