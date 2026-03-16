import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  updateUserProfile, 
  uploadProfilePicture, 
  updateContactInfo, 
  updateDisplayName 
} from '../services/userProfileService';
import '../styles/profilePage.css';

const ProfilePage = () => {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form with user data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
      setCity(userProfile.city || '');
      setZipCode(userProfile.zipCode || '');
      setBio(userProfile.bio || '');
      setProfilePicture(userProfile.photoURL || '');
      setPreviewImage(userProfile.photoURL || '');
    }
  }, [userProfile]);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    try {
      setUploadingImage(true);
      setError('');
      console.log('🚀 Uploading profile picture for user:', currentUser.uid);
      const photoURL = await uploadProfilePicture(currentUser.uid, file);
      console.log('📸 Upload completed, URL:', photoURL);
      setProfilePicture(photoURL);
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        photoURL
      }));
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Error uploading image:', err);
      setError(`Failed to upload image: ${err.message}`);
      setPreviewImage(profilePicture); // Revert preview
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBasicInfoUpdate = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await updateDisplayName(currentUser.uid, displayName);
      
      // Update local state
      setUserProfile({
        ...userProfile,
        displayName
      });
      
      setSuccess('Username updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating display name:', err);
      setError('Failed to update username. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContactInfoUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      
      const contactData = {
        phone,
        address,
        city,
        zipCode,
        bio
      };

      await updateContactInfo(currentUser.uid, contactData);
      
      // Update local state
      setUserProfile({
        ...userProfile,
        ...contactData
      });
      
      setSuccess('Contact information updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating contact info:', err);
      setError('Failed to update contact information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container extra-space obj-width">
      <h1>My Profile</h1>

      {error && (
        <div className="alert alert-error">
          <i className="bx bx-x-circle"></i>
          {error}
          <button onClick={() => setError('')} className="close-alert">&times;</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="bx bx-check-circle"></i>
          {success}
          <button onClick={() => setSuccess('')} className="close-alert">&times;</button>
        </div>
      )}

      <div className="profile-wrapper">
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="picture-wrapper">
            {previewImage ? (
              <img src={previewImage} alt={displayName} className="profile-image" />
            ) : (
              <div className="profile-image-placeholder">
                <i className="bx bxs-user-circle"></i>
              </div>
            )}
          </div>

          <div className="picture-upload">
            <label htmlFor="picture-input" className="upload-btn">
              <i className="bx bx-cloud-upload"></i>
              {uploadingImage ? 'Uploading...' : 'Upload Picture'}
            </label>
            <input
              id="picture-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              style={{ display: 'none' }}
            />
            <p className="upload-hint">JPG, PNG or GIF (Max. 5MB)</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <i className="bx bx-user"></i>
            Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <i className="bx bx-phone"></i>
            Contact Info
          </button>
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <form onSubmit={handleBasicInfoUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={currentUser.email}
                disabled
                className="form-input disabled"
              />
              <small>Cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="form-input"
                maxLength="50"
              />
              <small>{displayName.length}/50 characters</small>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !displayName.trim()}
            >
              {loading ? (
                <>
                  <i className="bx bx-loader-alt spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bx bx-check"></i>
                  Save Changes
                </>
              )}
            </button>
          </form>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact' && (
          <form onSubmit={handleContactInfoUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 XXX XXX XXXX"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your street address"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipcode">ZIP Code</label>
                <input
                  id="zipcode"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter ZIP code"
                  className="form-input"
                  maxLength="10"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself (Optional)"
                className="form-input textarea"
                rows="4"
                maxLength="500"
              />
              <small>{bio.length}/500 characters</small>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="bx bx-loader-alt spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bx bx-check"></i>
                  Save Changes
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
