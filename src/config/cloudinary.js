// Cloudinary Configuration
// Get your credentials from https://cloudinary.com/console

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dlmudri2d',
  UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'alacritas',
  API_KEY: process.env.REACT_APP_CLOUDINARY_API_KEY || '771479363279617'
};

// Cloudinary URLs
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/auto/upload`;

// File upload folder paths
export const CLOUDINARY_FOLDERS = {
  RESUME: 'alacritas/applications/resume',
  CERTIFICATE: 'alacritas/applications/certificate',
  ACHIEVEMENTS: 'alacritas/applications/achievements',
  JOB_REQUEST: 'alacritas/job-requests',
  PROFILE: 'alacritas/profiles'
};
