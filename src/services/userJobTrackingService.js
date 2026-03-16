// User Job Tracking Service
// Tracks user viewed jobs and retrieves job types from viewed/applied jobs

import { db } from '../config/firebase';
import { ref, set, get, push } from 'firebase/database';
import { getUserApplications } from './applicationService';

// Track a viewed job
export const trackViewedJob = async (userId, jobId, jobData) => {
  try {
    const viewedJobRef = ref(db, `users/${userId}/viewedJobs/${jobId}`);
    await set(viewedJobRef, {
      jobId,
      jobTitle: jobData?.title || '',
      jobType: jobData?.type || '',
      viewedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error tracking viewed job:', error);
    throw error;
  }
};

// Get user's viewed jobs
export const getUserViewedJobs = async (userId) => {
  try {
    const viewedJobsRef = ref(db, `users/${userId}/viewedJobs`);
    const snapshot = await get(viewedJobsRef);

    if (snapshot.exists()) {
      const viewedJobsData = snapshot.val();
      const viewedJobs = Object.entries(viewedJobsData).map(([key, value]) => ({
        id: key,
        ...value
      }));
      return viewedJobs;
    }
    return [];
  } catch (error) {
    console.error('Error fetching user viewed jobs:', error);
    throw error;
  }
};

// Get unique job types from viewed and applied jobs
export const getUserJobTypes = async (userId, allJobs = []) => {
  try {
    // Get viewed jobs
    const viewedJobs = await getUserViewedJobs(userId);
    
    // Get applied jobs
    const applications = await getUserApplications(userId);

    // Extract unique job types
    const jobTypes = new Set();
    
    // Add types from viewed jobs
    viewedJobs.forEach(job => {
      if (job.jobType) {
        jobTypes.add(job.jobType.toLowerCase());
      }
    });

    // Add types from applied jobs
    applications.forEach(app => {
      if (app.jobId && allJobs.length > 0) {
        const job = allJobs.find(j => j.id === app.jobId);
        if (job && job.type) {
          jobTypes.add(job.type.toLowerCase());
        }
      }
    });

    return Array.from(jobTypes).sort();
  } catch (error) {
    console.error('Error getting user job types:', error);
    return [];
  }
};

// Get recent jobs by user's viewed/applied job types
export const getRecentJobsByUserTypes = (jobs, userJobTypes, limit = 4) => {
  try {
    if (userJobTypes.length === 0) {
      // If no viewed/applied jobs, return recent jobs
      return jobs
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        })
        .slice(0, limit);
    }

    const filteredJobs = jobs.filter(job =>
      job.type && userJobTypes.includes(job.type.toLowerCase())
    );

    return filteredJobs
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent jobs by user types:', error);
    return [];
  }
};
