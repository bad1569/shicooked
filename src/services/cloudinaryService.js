// Cloudinary Upload Service
// Handles file uploads to Cloudinary for job applications

import { CLOUDINARY_CONFIG, CLOUDINARY_URL, CLOUDINARY_FOLDERS } from '../config/cloudinary';

/**
 * Upload file to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} fileType - Type of file: 'resume', 'certificate', 'achievements'
 * @returns {Promise<string>} - URL of uploaded file
 */
export const uploadToCloudinary = async (file, fileType = 'resume') => {
  try {
    // Validate Cloudinary configuration
    if (!CLOUDINARY_CONFIG.CLOUD_NAME || CLOUDINARY_CONFIG.CLOUD_NAME === 'YOUR_CLOUD_NAME') {
      throw new Error('Cloudinary is not configured. Please set up REACT_APP_CLOUDINARY_CLOUD_NAME in your .env file');
    }

    if (!CLOUDINARY_CONFIG.UPLOAD_PRESET || CLOUDINARY_CONFIG.UPLOAD_PRESET === 'YOUR_UPLOAD_PRESET') {
      throw new Error('Cloudinary upload preset is not configured. Please set up REACT_APP_CLOUDINARY_UPLOAD_PRESET in your .env file');
    }

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Determine folder based on file type
    const folder = CLOUDINARY_FOLDERS[fileType.toUpperCase()] || CLOUDINARY_FOLDERS.RESUME;

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('resource_type', 'auto');
    formData.append('tags', `alacritas,${fileType}`);
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');

    console.log(
      '%c[INFO] Uploading to Cloudinary',
      'background: #2196F3; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadType: fileType,
        folder: folder
      }
    );

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload file to Cloudinary');
    }

    const data = await response.json();

    console.log(
      '%c[SUCCESS] File uploaded to Cloudinary',
      'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      {
        publicId: data.public_id,
        secureUrl: data.secure_url,
        fileName: file.name
      }
    );

    // Return the secure URL
    return data.secure_url;
  } catch (error) {
    console.error(
      '%c[ERROR] Cloudinary upload failed',
      'background: #f44336; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      {
        error: error.message,
        fileName: file?.name
      }
    );
    throw error;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Object} files - Object with file types as keys and File objects as values
 * @returns {Promise<Object>} - URLs for each uploaded file
 */
export const uploadMultipleFilesToCloudinary = async (files) => {
  const uploadedUrls = {};

  try {
    // Upload each file type
    for (const [fileType, file] of Object.entries(files)) {
      if (file) {
        uploadedUrls[fileType] = await uploadToCloudinary(file, fileType);
      }
    }

    return uploadedUrls;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

/**
 * Delete file from Cloudinary (if needed)
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<Object>} - Response from Cloudinary
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    console.log(
      '%c[INFO] Deleting file from Cloudinary',
      'background: #FF9800; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      { publicId }
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/resources/image/upload`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${btoa(`${CLOUDINARY_CONFIG.API_KEY}:`)}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete file from Cloudinary');
    }

    console.log(
      '%c[SUCCESS] File deleted from Cloudinary',
      'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      { publicId }
    );

    return await response.json();
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};
