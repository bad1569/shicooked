import React, { createContext, useState, useContext } from 'react';
import { jobsData } from '../data/jobsData';

const JobsContext = createContext();

export const JobsProvider = ({ children }) => {
    const [jobs, setJobs] = useState(jobsData);
    const [selectedJob, setSelectedJob] = useState(null);
    const [filteredJobs, setFilteredJobs] = useState(jobsData);

    const getJobById = (id) => {
        return jobs[parseInt(id)];
    };

    const filterJobsByType = (type) => {
        if (type === 'all') {
            setFilteredJobs(jobs);
        } else {
            const filtered = jobs.filter(job => job.type.toLowerCase() === type.toLowerCase());
            setFilteredJobs(filtered);
        }
    };

    const searchJobs = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredJobs(jobs);
        } else {
            const filtered = jobs.filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredJobs(filtered);
        }
    };

    const addJob = (newJob) => {
        const jobWithIndex = {
            ...newJob,
            index: jobs.length
        };
        const updatedJobs = [...jobs, jobWithIndex];
        setJobs(updatedJobs);
        setFilteredJobs(updatedJobs);
        
        // TODO: Save to Firebase Firestore for persistence
        console.log('Job added:', jobWithIndex);
        
        return jobWithIndex;
    };

    const updateJob = (jobId, updatedJobData) => {
        const updatedJobs = jobs.map((job, idx) => {
            if (idx === parseInt(jobId)) {
                return { ...job, ...updatedJobData };
            }
            return job;
        });
        setJobs(updatedJobs);
        setFilteredJobs(updatedJobs);
        
        // TODO: Update Firebase Firestore
        console.log('Job updated:', updatedJobs[jobId]);
        
        return updatedJobs[jobId];
    };

    const deleteJob = (jobId) => {
        const updatedJobs = jobs.filter((_, idx) => idx !== parseInt(jobId));
        setJobs(updatedJobs);
        setFilteredJobs(updatedJobs);
        
        // TODO: Delete from Firebase Firestore
        console.log('Job deleted with index:', jobId);
    };

    return (
        <JobsContext.Provider
            value={{
                jobs,
                selectedJob,
                setSelectedJob,
                filteredJobs,
                getJobById,
                filterJobsByType,
                searchJobs,
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
