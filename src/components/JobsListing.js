import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobsContext';
import { useAuth } from '../context/AuthContext';
import { getUserJobTypes, getRecentJobsByUserTypes } from '../services/userJobTrackingService';

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
  const { getRecentJobs, getJobsByType, jobs, loading } = useJobs();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [userJobTypes, setUserJobTypes] = useState([]);
  const [dynamicJobTypes, setDynamicJobTypes] = useState([]);
  const [loadingUserTypes, setLoadingUserTypes] = useState(true);

  // Fetch user's job types if logged in
  useEffect(() => {
    if (currentUser) {
      const fetchUserJobTypes = async () => {
        try {
          setLoadingUserTypes(true);
          const types = await getUserJobTypes(currentUser.uid, jobs);
          setUserJobTypes(types);
          
          // Create dynamic job types list
          const dynamicTypes = [
            { key: 'all', label: 'Recent Jobs' }
          ];
          
          if (types.length > 0) {
            types.forEach(type => {
              dynamicTypes.push({
                key: type,
                label: type.charAt(0).toUpperCase() + type.slice(1) + ' Jobs'
              });
            });
          }
          
          setDynamicJobTypes(dynamicTypes);
        } catch (error) {
          console.error('Error fetching user job types:', error);
          // Fallback to default types if error
          setDynamicJobTypes([
            { key: 'all', label: 'Recent Jobs' },
            { key: 'fulltime', label: 'Fulltime Jobs' },
            { key: 'parttime', label: 'Parttime Jobs' },
            { key: 'freelance', label: 'Freelance Jobs' }
          ]);
        } finally {
          setLoadingUserTypes(false);
        }
      };
      
      fetchUserJobTypes();
    } else {
      setLoadingUserTypes(false);
    }
  }, [currentUser, jobs]);

  const handleJobClick = (jobId) => {
    localStorage.setItem('job', jobId);
    navigate(`/job-details/${jobId}`);
  };

  const handleTypeFilter = (type) => {
    setActiveFilter(type);
  };

  // Get jobs based on filter
  const getDisplayedJobs = () => {
    if (activeFilter === 'all') {
      if (currentUser && userJobTypes.length > 0) {
        return getRecentJobsByUserTypes(jobs, userJobTypes, 4);
      }
      return getRecentJobs(4);
    } else {
      return getJobsByType(activeFilter, 4);
    }
  };

  const displayedJobs = getDisplayedJobs();

  // Hide section if user not signed in
  if (!currentUser) {
    return null;
  }

  if (loading || loadingUserTypes) {
    return (
      <section className="jobs sec-space obj-width">
        <h2>Jobs in demand</h2>
        <p>Loading jobs...</p>
      </section>
    );
  }

  return (
    <section className="jobs sec-space obj-width">
      <h2>Jobs in demand</h2>
      <p>Viewed and all time top selling services on Alacritas.</p>

      {dynamicJobTypes.length > 0 && (
        <ul className="job-id">
          {dynamicJobTypes.map((type) => (
            <li
              key={type.key}
              data-target={type.key}
              className={activeFilter === type.key ? 'active' : ''}
              onClick={() => handleTypeFilter(type.key)}
              style={{ textTransform: 'capitalize', cursor: 'pointer' }}
            >
              {type.label}
            </li>
          ))}
        </ul>
      )}

      <div className="jobs-container">
        {displayedJobs.length > 0 ? (
          displayedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => handleJobClick(job.id)}
            />
          ))
        ) : (
          <p>No jobs available in this category.</p>
        )}
      </div>
    </section>
  );
};

export default JobsListing;
