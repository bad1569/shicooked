// User Profile Service
// Handles profile updates, picture uploads, and contact information

import { db } from '../config/firebase';
import { ref, set, get, update } from 'firebase/database';
import { uploadToCloudinary } from './cloudinaryService';
import { updateProfile } from 'firebase/auth';

// Update user profile information
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    
    // Get current data
    const snapshot = await get(userRef);
    const currentData = snapshot.val() || {};
    
    // Merge with new data
    const updatedData = {
      ...currentData,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    await update(userRef, updatedData);
    
    console.log('✅ Profile updated successfully:', {
      userId,
      updatedFields: Object.keys(profileData),
      timestamp: new Date().toISOString()
    });
    
    return updatedData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Upload profile picture to Cloudinary and save to Firebase
export const uploadProfilePicture = async (userId, file) => {
  try {
    console.log('📸 Starting profile picture upload:', { userId, fileName: file.name });
    
    // Upload to Cloudinary
    const photoURL = await uploadToCloudinary(file, 'profile');
    
    console.log('✅ Cloudinary upload successful:', photoURL);
    
    // Save to Firebase
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
      photoURL,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Profile picture saved to Firebase:', {
      userId,
      photoURL,
      timestamp: new Date().toISOString()
    });
    
    return photoURL;
  } catch (error) {
    console.error('❌ Error uploading profile picture:', error);
    throw error;
  }
};

// Update profile picture and bio
export const updateProfilePicture = async (userId, photoURL) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    
    await update(userRef, {
      photoURL,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Profile picture updated:', photoURL);
    return photoURL;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
};

// Update contact information
export const updateContactInfo = async (userId, contactData) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    
    const updatedContactData = {
      phone: contactData.phone || '',
      address: contactData.address || '',
      city: contactData.city || '',
      zipCode: contactData.zipCode || '',
      bio: contactData.bio || '',
      updatedAt: new Date().toISOString()
    };
    
    await update(userRef, updatedContactData);
    
    console.log('✅ Contact information updated:', updatedContactData);
    return updatedContactData;
  } catch (error) {
    console.error('Error updating contact information:', error);
    throw error;
  }
};

// Get complete user profile
export const getUserProfile = async (userId) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update display name
export const updateDisplayName = async (userId, displayName) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    
    await update(userRef, {
      displayName,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Display name updated:', displayName);
    return displayName;
  } catch (error) {
    console.error('Error updating display name:', error);
    throw error;
  }
};
