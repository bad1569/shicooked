// Firebase Realtime Database Service
// This file will handle all database operations

import { db } from '../config/firebase';
import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  onValue,
  off
} from 'firebase/database';

// Database References
const JOBS_REF = 'jobs';
const CONTACTS_REF = 'contacts';

// ============ JOBS OPERATIONS ============

export const addJobToDB = async (jobData) => {
  try {
    const jobsRef = ref(db, JOBS_REF);
    const newJobRef = push(jobsRef);
    const jobWithTimestamp = {
      ...jobData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await set(newJobRef, jobWithTimestamp);
    return newJobRef.key;
  } catch (error) {
    console.error('Error adding job:', error);
    throw error;
  }
};

export const getJobsFromDB = async () => {
  try {
    const jobsRef = ref(db, JOBS_REF);
    const snapshot = await get(jobsRef);
    
    if (snapshot.exists()) {
      const jobsData = snapshot.val();
      // Convert object to array with keys
      const jobs = Object.entries(jobsData).map(([key, value]) => ({
        id: key,
        ...value
      }));
      return jobs;
    }
    return [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const subscribeToJobs = (callback) => {
  try {
    const jobsRef = ref(db, JOBS_REF);
    const unsubscribe = onValue(jobsRef, (snapshot) => {
      if (snapshot.exists()) {
        const jobsData = snapshot.val();
        const jobs = Object.entries(jobsData).map(([key, value]) => ({
          id: key,
          ...value
        }));
        callback(jobs);
      } else {
        callback([]);
      }
    });
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to jobs:', error);
    throw error;
  }
};

export const updateJobInDB = async (jobId, jobData) => {
  try {
    const jobRef = ref(db, `${JOBS_REF}/${jobId}`);
    const updatedData = {
      ...jobData,
      updatedAt: new Date().toISOString()
    };
    await update(jobRef, updatedData);
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

export const deleteJobFromDB = async (jobId) => {
  try {
    const jobRef = ref(db, `${JOBS_REF}/${jobId}`);
    await remove(jobRef);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// ============ CONTACT OPERATIONS ============

export const addContactToDB = async (contactData) => {
  try {
    const contactsRef = ref(db, CONTACTS_REF);
    const newContactRef = push(contactsRef);
    const contactWithTimestamp = {
      ...contactData,
      timestamp: new Date().toISOString(),
      read: false
    };
    await set(newContactRef, contactWithTimestamp);
    return newContactRef.key;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

export const getContactsFromDB = async () => {
  try {
    const contactsRef = ref(db, CONTACTS_REF);
    const snapshot = await get(contactsRef);
    
    if (snapshot.exists()) {
      const contactsData = snapshot.val();
      const contacts = Object.entries(contactsData).map(([key, value]) => ({
        id: key,
        ...value
      }));
      return contacts;
    }
    return [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const deleteContactFromDB = async (contactId) => {
  try {
    const contactRef = ref(db, `${CONTACTS_REF}/${contactId}`);
    await remove(contactRef);
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

// ============ SEARCH & FILTER OPERATIONS ============

export const filterJobsByType = async (jobs, jobType) => {
  try {
    if (jobType.toLowerCase() === 'all') {
      return jobs;
    }
    return jobs.filter(job => job.type && job.type.toLowerCase() === jobType.toLowerCase());
  } catch (error) {
    console.error('Error filtering jobs:', error);
    throw error;
  }
};

export const getRecentJobs = (jobs, limit = 4) => {
  try {
    // Sort by createdAt descending and return top X
    return jobs
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent jobs:', error);
    return [];
  }
};

export const searchJobsByTitle = async (jobs, searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return jobs;
    }
    return jobs.filter(job =>
      job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
};
