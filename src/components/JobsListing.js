import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobsContext';

const JobCard = ({ job, onClick }) => {
  return (
    <div className="jList" onClick={onClick}>
      <img src={job.image} alt={job.title} />
      <h3>{job.title}</h3>
      <p>{job.rate}</p>
      <span className="job-type">{job.type}</span>
    </div>
  );
};

const JobsListing = () => {
  const { filteredJobs, filterJobsByType } = useJobs();
  const navigate = useNavigate();

  const jobTypes = ['all', 'fulltime', 'parttime', 'freelance'];

  const handleJobClick = (index) => {
    localStorage.setItem('job', index);
    navigate(`/job-details/${index}`);
  };

  const handleTypeFilter = (type) => {
    filterJobsByType(type);
  };

  return (
    <section className="jobs sec-space obj-width">
      <h2>Jobs in demand</h2>
      <p>Viewed and all time top selling services on Alacritas.</p>

      <ul className="job-id">
        {jobTypes.map((type) => (
          <li
            key={type}
            data-target={type}
            className={type === 'all' ? 'active' : ''}
            onClick={() => handleTypeFilter(type)}
            style={{ textTransform: 'capitalize' }}
          >
            {type === 'all' ? 'Recent Jobs' : `${type} Jobs`}
          </li>
        ))}
      </ul>

      <div className="jobs-container">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.index}
            job={job}
            onClick={() => handleJobClick(job.index)}
          />
        ))}
      </div>
    </section>
  );
};

export default JobsListing;
