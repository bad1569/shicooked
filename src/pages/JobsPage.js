import React, { useState } from 'react';
import { useJobs } from '../context/JobsContext';
import { useNavigate } from 'react-router-dom';

const JobsPage = () => {
  const { filteredJobs, searchJobs, loading } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchJobs(value);
  };

  const handleJobClick = (jobId) => {
    localStorage.setItem('job', jobId);
    navigate(`/job-details/${jobId}`);
  };

  if (loading) {
    return (
      <section className="jobs extra-space sec-space obj-width">
        <h2>Jobs in demand</h2>
        <p>Loading jobs...</p>
      </section>
    );
  }

  return (
    <section className="jobs extra-space sec-space obj-width">
      <h2>Jobs in demand</h2>
      <p>Viewed and all time top selling services on Alacritas.</p>

      <form onSubmit={(e) => e.preventDefault()}>
        <i className="bx bx-search"></i>
        <input
          type="text"
          placeholder="Search for jobs..."
          id="searchBar"
          value={searchTerm}
          onChange={handleSearch}
        />
      </form>

      <div className="jobs-container" id="root">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="jList"
              onClick={() => handleJobClick(job.id)}
            >
              <img src={job.image} alt={job.title} />
              <h3>{job.title}</h3>
              <p>{job.rate}</p>
              <span className="job-type">{job.type}</span>
            </div>
          ))
        ) : (
          <p>No jobs found.</p>
        )}
      </div>
    </section>
  );
};

export default JobsPage;
