import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postJobRequest, LUZON_LOCATIONS, getWageEstimate } from '../services/jobRequestService';
import { uploadToCloudinary } from '../services/cloudinaryService';
import '../styles/jobRequestModal.css';

const JobRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillLevel: 'laborer',
    location: 'Metro Manila',
    estimatedDays: '1',
    images: [],
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wageEstimate, setWageEstimate] = useState(null);

  // Update wage estimate when skill level, location, or days change
  useEffect(() => {
    const estimate = getWageEstimate(
      formData.location,
      formData.skillLevel,
      parseInt(formData.estimatedDays) || 1
    );
    setWageEstimate(estimate);
  }, [formData.location, formData.skillLevel, formData.estimatedDays]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim() || formData.title.length < 5) {
      setError('Job title must be at least 5 characters');
      return;
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      setError('Description must be at least 20 characters');
      return;
    }

    if (parseInt(formData.estimatedDays) < 1 || parseInt(formData.estimatedDays) > 365) {
      setError('Estimated days must be between 1 and 365');
      return;
    }

    try {
      setLoading(true);

      let imageUrls = [];

      // Upload images to Cloudinary if any
      if (formData.images.length > 0) {
        try {
          for (let i = 0; i < formData.images.length; i++) {
            const url = await uploadToCloudinary(formData.images[i], 'job_request');
            imageUrls.push(url);
          }
        } catch (uploadError) {
          console.warn('Image upload partial or failed:', uploadError);
          // Continue with what we have uploaded
        }
      }

      // Post job request
      const requestData = {
        title: formData.title,
        description: formData.description,
        skillLevel: formData.skillLevel,
        location: formData.location,
        estimatedDays: formData.estimatedDays,
        images: imageUrls,
      };

      const result = await postJobRequest(currentUser.uid, requestData);

      setSuccess('Job request posted successfully! Admin will review it shortly.');
      setFormData({
        title: '',
        description: '',
        skillLevel: 'laborer',
        location: 'Metro Manila',
        estimatedDays: '1',
        images: [],
      });
      setPreviewImages([]);

      // Call success callback
      if (onSuccess) {
        setTimeout(() => onSuccess(result), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to post job request');
      console.error('Error posting job request:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content job-request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Post a Job Request</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Job Title */}
            <div className="form-group">
              <label htmlFor="title">Type of Work *</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="e.g., House Renovation, Electrical Repair, Plumbing"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the work you need done in detail..."
                rows="4"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">Location (Luzon) *</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
                required
              >
                {Object.keys(LUZON_LOCATIONS).sort().map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Level */}
            <div className="form-group">
              <label htmlFor="skillLevel">Worker Type *</label>
              <select
                id="skillLevel"
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="laborer">Laborer (Minimum Wage)</option>
                <option value="skilled">Skilled Worker (50% above minimum)</option>
                <option value="specialist">Specialist (100% above minimum)</option>
              </select>
            </div>

            {/* Estimated Days */}
            <div className="form-group">
              <label htmlFor="estimatedDays">Estimated Days for Completion *</label>
              <input
                type="number"
                id="estimatedDays"
                name="estimatedDays"
                min="1"
                max="365"
                value={formData.estimatedDays}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            {/* Wage Estimate */}
            {wageEstimate && (
              <div className="wage-estimate-box">
                <h4>Estimated Budget</h4>
                <div className="wage-details">
                  <div className="wage-row">
                    <span>Location:</span>
                    <strong>{wageEstimate.location}</strong>
                  </div>
                  <div className="wage-row">
                    <span>Worker Type:</span>
                    <strong>{wageEstimate.skillDescription}</strong>
                  </div>
                  <div className="wage-row">
                    <span>Daily Rate:</span>
                    <strong>₱{wageEstimate.dailyWage.toLocaleString()}</strong>
                  </div>
                  <div className="wage-row">
                    <span>Days:</span>
                    <strong>{wageEstimate.estimatedDays}</strong>
                  </div>
                  <div className="wage-row total">
                    <span>Total Budget:</span>
                    <strong>₱{wageEstimate.totalBudget.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Images Upload */}
            <div className="form-group">
              <label htmlFor="images">
                Pictures of Desired Work (Optional - Max 5 images)
              </label>
              <div className="image-upload-box">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading || previewImages.length >= 5}
                />
                <p>Click to select images or drag and drop</p>
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="image-preview-container">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Posting Request...' : 'Post Job Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobRequestModal;
