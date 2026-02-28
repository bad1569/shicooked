import React, { useState } from 'react';
import { useJobs } from '../context/JobsContext';
import { useNavigate } from 'react-router-dom';

const JobsPage = () => {
  const { filteredJobs, searchJobs } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchJobs(value);
  };

  const handleJobClick = (index) => {
    localStorage.setItem('job', index);
    navigate(`/job-details/${index}`);
  };

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
        {filteredJobs.map((job) => (
          <div
            key={job.index}
            className="jList"
            onClick={() => handleJobClick(job.index)}
          >
            <img src={job.image} alt={job.title} />
            <h3>{job.title}</h3>
            <p>{job.rate}</p>
            <span className="job-type">{job.type}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default JobsPage;
