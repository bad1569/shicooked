// Job Application Service
// Handles job applications and file uploads to Cloudinary

import { db } from '../config/firebase';
import { ref, set, get, push } from 'firebase/database';
import { uploadToCloudinary } from './cloudinaryService';
import { sendApplicationNotification } from './notificationService';

const APPLICATIONS_REF = 'applications';

// Upload file to Cloudinary
export const uploadApplicationFile = async (userId, jobId, file, fileType) => {
  try {
    const fileURL = await uploadToCloudinary(file, fileType);
    
    console.log(
      '%c[SUCCESS] Application file uploaded',
      'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      {
        fileType,
        fileURL,
        userId,
        jobId
      }
    );
    
    return fileURL;
  } catch (error) {
    console.error(`Error uploading ${fileType}:`, error);
    throw error;
  }
};

// Submit job application
export const submitJobApplication = async (userId, jobId, applicationData) => {
  try {
    const applicationsRef = ref(db, `${APPLICATIONS_REF}/${jobId}`);
    const newApplicationRef = push(applicationsRef);
    
    const application = {
      applicationId: newApplicationRef.key,
      userId,
      jobId,
      fullName: applicationData.fullName,
      email: applicationData.email,
      phone: applicationData.phone,
      age: applicationData.age,
      location: applicationData.location,
      experience: applicationData.experience,
      skills: applicationData.skills,
      message: applicationData.message,
      resumeURL: applicationData.resumeURL || null,
      certificateURL: applicationData.certificateURL || null,
      achievementsURL: applicationData.achievementsURL || null,
      linkedinProfile: applicationData.linkedinProfile || '',
      portfolio: applicationData.portfolio || '',
      status: 'pending',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await set(newApplicationRef, application);

    // Also save to user's applications list
    const userApplicationRef = ref(db, `users/${userId}/applications/${newApplicationRef.key}`);
    await set(userApplicationRef, {
      jobId,
      applicationId: newApplicationRef.key,
      appliedAt: application.appliedAt,
      status: 'pending'
    });

    return application;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

// Get user applications
export const getUserApplications = async (userId) => {
  try {
    const userApplicationsRef = ref(db, `users/${userId}/applications`);
    const snapshot = await get(userApplicationsRef);

    if (snapshot.exists()) {
      const applicationsData = snapshot.val();
      const applications = Object.entries(applicationsData).map(([key, value]) => ({
        id: key,
        ...value
      }));
      return applications;
    }
    return [];
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw error;
  }
};

// Get job applications (for admins)
export const getJobApplications = async (jobId) => {
  try {
    const jobApplicationsRef = ref(db, `${APPLICATIONS_REF}/${jobId}`);
    const snapshot = await get(jobApplicationsRef);

    if (snapshot.exists()) {
      const applicationsData = snapshot.val();
      const applications = Object.entries(applicationsData).map(([key, value]) => ({
        id: key,
        ...value
      }));
      return applications;
    }
    return [];
  } catch (error) {
    console.error('Error fetching job applications:', error);
    throw error;
  }
};

// Update application status (for admins)
export const updateApplicationStatus = async (jobId, applicationId, status, jobTitle = '') => {
  try {
    const applicationRef = ref(db, `${APPLICATIONS_REF}/${jobId}/${applicationId}`);
    const snapshot = await get(applicationRef);

    if (snapshot.exists()) {
      const applicationData = snapshot.val();
      const updatedApplication = {
        ...applicationData,
        status,
        updatedAt: new Date().toISOString()
      };
      await set(applicationRef, updatedApplication);
      
      // Send notification to user if status is not pending
      if (status !== 'pending' && applicationData.userId) {
        try {
          await sendApplicationNotification(
            applicationData.userId,
            jobTitle || applicationData.jobTitle || 'Your application',
            status
          );
        } catch (notifError) {
          console.warn('Failed to send notification, but application status was updated:', notifError);
        }
      }
      
      return updatedApplication;
    }
    throw new Error('Application not found');
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

// Check if user already applied for job
export const hasUserApplied = async (userId, jobId) => {
  try {
    const userApplicationsRef = ref(db, `users/${userId}/applications`);
    const snapshot = await get(userApplicationsRef);

    if (snapshot.exists()) {
      const applications = snapshot.val();
      return Object.values(applications).some(app => app.jobId === jobId);
    }
    return false;
  } catch (error) {
    console.error('Error checking application status:', error);
    return false;
  }
};
