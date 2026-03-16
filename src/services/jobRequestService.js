// Job Request Service
// Handles user job requests - users can post custom work requests instead of applying to existing jobs

import { db } from '../config/firebase';
import { ref, set, push, get, update, query, orderByChild, equalTo } from 'firebase/database';

const JOB_REQUESTS_REF = 'jobRequests';

/**
 * Luzon locations with geolocation data
 */
export const LUZON_LOCATIONS = {
  'Metro Manila': { lat: 14.5995, lng: 120.9842, minWage: 645, region: 'NCR' },
  'Makati': { lat: 14.5549, lng: 121.0193, minWage: 645, region: 'NCR' },
  'Taguig': { lat: 14.5794, lng: 121.0554, minWage: 645, region: 'NCR' },
  'Quezon City': { lat: 14.6091, lng: 121.0223, minWage: 645, region: 'NCR' },
  'Caloocan': { lat: 14.6226, lng: 120.9605, minWage: 645, region: 'NCR' },
  'Pasay': { lat: 14.5500, lng: 121.0000, minWage: 645, region: 'NCR' },
  'Pasig': { lat: 14.5736, lng: 121.0911, minWage: 645, region: 'NCR' },
  'Marikina': { lat: 14.6418, lng: 121.1619, minWage: 645, region: 'NCR' },
  'Parañaque': { lat: 14.3542, lng: 121.0122, minWage: 645, region: 'NCR' },
  'Las Piñas': { lat: 14.3567, lng: 120.9789, minWage: 645, region: 'NCR' },
  'Quirino': { lat: 14.7522, lng: 121.0093, minWage: 645, region: 'NCR' },
  'San Juan': { lat: 14.5898, lng: 121.0272, minWage: 645, region: 'NCR' },
  'Malabon': { lat: 14.6511, lng: 120.9561, minWage: 645, region: 'NCR' },
  'Navotas': { lat: 14.6586, lng: 120.9294, minWage: 645, region: 'NCR' },
  'Valenzuela': { lat: 14.7139, lng: 120.9814, minWage: 645, region: 'NCR' },
  'Muntinlupa': { lat: 14.3867, lng: 121.0519, minWage: 645, region: 'NCR' },
  'Antipolo': { lat: 14.5880, lng: 121.1775, minWage: 600, region: 'Calabarzon' },
  'Cavite City': { lat: 14.4694, lng: 120.8867, minWage: 588, region: 'Calabarzon' },
  'Dasmariñas': { lat: 14.2917, lng: 120.9231, minWage: 588, region: 'Calabarzon' },
  'Kawit': { lat: 14.4425, lng: 120.8392, minWage: 588, region: 'Calabarzon' },
  'Laguna': { lat: 14.3169, lng: 121.2323, minWage: 600, region: 'Calabarzon' },
  'San Pedro': { lat: 14.3506, lng: 121.0139, minWage: 600, region: 'Calabarzon' },
  'Tanay': { lat: 14.5756, lng: 121.3653, minWage: 600, region: 'Calabarzon' },
  'Cainta': { lat: 14.5508, lng: 121.2867, minWage: 600, region: 'Calabarzon' },
  'Baguio': { lat: 16.4023, lng: 120.5960, minWage: 527, region: 'CAR' },
  'Dagupan': { lat: 16.0411, lng: 120.3353, minWage: 554, region: 'Region I' },
  'Laoag': { lat: 18.1946, lng: 120.5984, minWage: 515, region: 'Region I' },
};

/**
 * Wage structure by skill level and region
 */
export const WAGE_STRUCTURE = {
  laborer: { multiplier: 1.0, description: 'Laborer (Minimum Wage)' },
  skilled: { multiplier: 1.5, description: 'Skilled Worker (50% above minimum)' },
  specialist: { multiplier: 2.0, description: 'Specialist (100% above minimum)' },
};

/**
 * Post a new job request
 * @param {string} userId - User ID
 * @param {Object} requestData - Job request data
 * @returns {Promise<Object>} - Created request
 */
export const postJobRequest = async (userId, requestData) => {
  try {
    const jobRequestsRef = ref(db, `${JOB_REQUESTS_REF}/${userId}`);
    const newRequestRef = push(jobRequestsRef);

    // Validate location
    const location = requestData.location;
    const locationData = LUZON_LOCATIONS[location];
    if (!locationData) {
      throw new Error('Invalid location selected');
    }

    // Calculate wage based on skill level and location
    const skillLevel = requestData.skillLevel;
    const wageMultiplier = WAGE_STRUCTURE[skillLevel]?.multiplier || 1;
    const dailyWage = Math.round(locationData.minWage * wageMultiplier);

    // Calculate total budget if days are provided
    const estimatedDays = parseInt(requestData.estimatedDays) || 1;
    const estimatedBudget = dailyWage * estimatedDays;

    const request = {
      requestId: newRequestRef.key,
      userId,
      title: requestData.title,
      description: requestData.description,
      skillLevel,
      location,
      status: 'pending',
      estimatedDays,
      dailyWage,
      estimatedBudget,
      images: requestData.images || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNotes: '',
    };

    await set(newRequestRef, request);

    console.log(
      '%c[SUCCESS] Job request posted',
      'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      { userId, title: requestData.title }
    );

    return request;
  } catch (error) {
    console.error('Error posting job request:', error);
    throw error;
  }
};

/**
 * Get all job requests by user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - User's job requests
 */
export const getUserJobRequests = async (userId) => {
  try {
    const requestsRef = ref(db, `${JOB_REQUESTS_REF}/${userId}`);
    const snapshot = await get(requestsRef);

    if (snapshot.exists()) {
      const requestsData = snapshot.val();
      const requests = Object.entries(requestsData).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [];
  } catch (error) {
    console.error('Error fetching user job requests:', error);
    return [];
  }
};

/**
 * Get all job requests (for admin)
 * @returns {Promise<Array>} - All job requests
 */
export const getAllJobRequests = async () => {
  try {
    const requestsRef = ref(db, JOB_REQUESTS_REF);
    const snapshot = await get(requestsRef);

    if (snapshot.exists()) {
      const allRequests = [];
      const usersData = snapshot.val();

      Object.entries(usersData).forEach(([userId, userRequests]) => {
        Object.entries(userRequests).forEach(([requestId, request]) => {
          allRequests.push({
            id: requestId,
            ...request,
            userId,
          });
        });
      });

      return allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [];
  } catch (error) {
    console.error('Error fetching all job requests:', error);
    return [];
  }
};

/**
 * Update job request status
 * @param {string} userId - User ID
 * @param {string} requestId - Request ID
 * @param {string} newStatus - New status (pending, under_review, accepted, rejected)
 * @param {string} adminNotes - Admin notes/feedback
 * @returns {Promise<Object>} - Updated request
 */
export const updateJobRequestStatus = async (userId, requestId, newStatus, adminNotes = '') => {
  try {
    const requestRef = ref(db, `${JOB_REQUESTS_REF}/${userId}/${requestId}`);
    const snapshot = await get(requestRef);

    if (snapshot.exists()) {
      const requestData = snapshot.val();
      const updates = {
        ...requestData,
        status: newStatus,
        adminNotes,
        updatedAt: new Date().toISOString(),
      };

      await set(requestRef, updates);

      console.log(
        '%c[SUCCESS] Job request status updated',
        'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        { userId, requestId, newStatus }
      );

      return updates;
    }
    throw new Error('Job request not found');
  } catch (error) {
    console.error('Error updating job request status:', error);
    throw error;
  }
};

/**
 * Delete job request (only pending requests can be deleted)
 * @param {string} userId - User ID
 * @param {string} requestId - Request ID
 * @returns {Promise<void>}
 */
export const deleteJobRequest = async (userId, requestId) => {
  try {
    const requestRef = ref(db, `${JOB_REQUESTS_REF}/${userId}/${requestId}`);
    const snapshot = await get(requestRef);

    if (snapshot.exists()) {
      const request = snapshot.val();
      if (request.status !== 'pending') {
        throw new Error('Only pending requests can be deleted');
      }

      await set(requestRef, null);
      console.log('Job request deleted:', requestId);
    }
  } catch (error) {
    console.error('Error deleting job request:', error);
    throw error;
  }
};

/**
 * Get geolocation-based wage estimate
 * @param {string} location - Location name
 * @param {string} skillLevel - Skill level
 * @param {number} days - Estimated days
 * @returns {Object} - Wage estimate
 */
export const getWageEstimate = (location, skillLevel, days = 1) => {
  const locationData = LUZON_LOCATIONS[location];
  if (!locationData) {
    return null;
  }

  const wageMultiplier = WAGE_STRUCTURE[skillLevel]?.multiplier || 1;
  const dailyWage = Math.round(locationData.minWage * wageMultiplier);
  const totalBudget = dailyWage * days;

  return {
    location,
    minWage: locationData.minWage,
    skillLevel,
    skillDescription: WAGE_STRUCTURE[skillLevel].description,
    dailyWage,
    estimatedDays: days,
    totalBudget,
  };
};
