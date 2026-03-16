import React, { createContext, useState, useContext, useEffect } from 'react';
import { getJobsFromDB, addJobToDB, updateJobInDB, deleteJobFromDB, subscribeToJobs } from '../services/firebaseService';

const JobsContext = createContext();

export const JobsProvider = ({ children }) => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load jobs from Firebase on mount
    useEffect(() => {
        const loadJobs = async () => {
            try {
                setLoading(true);
                const jobsData = await getJobsFromDB();
                setJobs(jobsData);
                setFilteredJobs(jobsData);
                setError(null);
            } catch (err) {
                console.error('Failed to load jobs:', err);
                setError('Failed to load jobs from database');
            } finally {
                setLoading(false);
            }
        };

        loadJobs();

        // Optional: Subscribe to real-time updates
        // const unsubscribe = subscribeToJobs((jobsData) => {
        //     setJobs(jobsData);
        //     setFilteredJobs(jobsData);
        // });
        // return unsubscribe;
    }, []);

    const getJobById = (id) => {
        return jobs.find(job => job.id === id);
    };

    const filterJobsByType = (type) => {
        if (type === 'all') {
            setFilteredJobs(jobs);
        } else {
            const filtered = jobs.filter(job => job.type && job.type.toLowerCase() === type.toLowerCase());
            setFilteredJobs(filtered);
        }
    };

    const searchJobs = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredJobs(jobs);
        } else {
            const filtered = jobs.filter(job =>
                job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredJobs(filtered);
        }
    };

    const getRecentJobs = (limit = 4) => {
        return jobs
            .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            })
            .slice(0, limit);
    };

    const getJobsByType = (type, limit = 4) => {
        return jobs
            .filter(job => job.type && job.type.toLowerCase() === type.toLowerCase())
            .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            })
            .slice(0, limit);
    };

    const addJob = async (newJob) => {
        try {
            const jobData = {
                ...newJob,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const jobId = await addJobToDB(jobData);
            const jobWithId = { ...jobData, id: jobId };
            
            const updatedJobs = [...jobs, jobWithId];
            setJobs(updatedJobs);
            setFilteredJobs(updatedJobs);
            
            console.log('Job added successfully:', jobWithId);
            return jobWithId;
        } catch (err) {
            console.error('Error adding job:', err);
            throw err;
        }
    };

    const updateJob = async (jobId, updatedJobData) => {
        try {
            const jobData = {
                ...updatedJobData,
                updatedAt: new Date().toISOString()
            };
            await updateJobInDB(jobId, jobData);
            
            const updatedJobs = jobs.map((job) => {
                if (job.id === jobId) {
                    return { ...job, ...jobData };
                }
                return job;
            });
            setJobs(updatedJobs);
            setFilteredJobs(updatedJobs);
            
            console.log('Job updated successfully:', jobId);
            return updatedJobs.find(j => j.id === jobId);
        } catch (err) {
            console.error('Error updating job:', err);
            throw err;
        }
    };

    const deleteJob = async (jobId) => {
        try {
            await deleteJobFromDB(jobId);
            
            const updatedJobs = jobs.filter((job) => job.id !== jobId);
            setJobs(updatedJobs);
            setFilteredJobs(updatedJobs);
            
            console.log('Job deleted successfully:', jobId);
        } catch (err) {
            console.error('Error deleting job:', err);
            throw err;
        }
    };

    return (
        <JobsContext.Provider
            value={{
                jobs,
                selectedJob,
                setSelectedJob,
                filteredJobs,
                loading,
                error,
                getJobById,
                filterJobsByType,
                searchJobs,
                getRecentJobs,
                getJobsByType,
                addJob,
                updateJob,
                deleteJob
            }}
        >
            {children}
        </JobsContext.Provider>
    );
};

export const useJobs = () => {
    const context = useContext(JobsContext);
    if (!context) {
        throw new Error('useJobs must be used within JobsProvider');
    }
    return context;
};
