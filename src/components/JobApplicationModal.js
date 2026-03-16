import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitJobApplication, uploadApplicationFile, hasUserApplied } from '../services/applicationService';
import '../styles/applicationModal.css';

const JobApplicationModal = ({ isOpen, onClose, job }) => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    location: '',
    experience: '',
    skills: '',
    message: '',
    linkedinProfile: '',
    portfolio: ''
  });

  const [files, setFiles] = useState({
    resume: null,
    certificate: null,
    achievements: null
  });

  const [filePreview, setFilePreview] = useState({
    resume: null,
    certificate: null,
    achievements: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Check if user already applied
  useEffect(() => {
    const checkApplication = async () => {
      if (currentUser && job?.id) {
        const hasApplied = await hasUserApplied(currentUser.uid, job.id);
        setAlreadyApplied(hasApplied);
      }
    };

    if (isOpen) {
      checkApplication();
    }
  }, [isOpen, currentUser, job]);

  // Populate form with user data
  useEffect(() => {
    if (userProfile && isOpen) {
      setFormData(prev => ({
        ...prev,
        fullName: userProfile.displayName || '',
        email: userProfile.email || ''
      }));
    }
  }, [userProfile, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFiles(prev => ({
        ...prev,
        [fileType]: file
      }));

      // Create preview URL
      const previewURL = URL.createObjectURL(file);
      setFilePreview(prev => ({
        ...prev,
        [fileType]: previewURL
      }));

      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!currentUser) {
      setError('Please log in to apply for this job');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.age || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);

      // Upload files if present
      let resumeURL = null;
      let certificateURL = null;
      let achievementsURL = null;

      if (files.resume) {
        resumeURL = await uploadApplicationFile(currentUser.uid, job.id, files.resume, 'resume');
      }

      if (files.certificate) {
        certificateURL = await uploadApplicationFile(currentUser.uid, job.id, files.certificate, 'certificate');
      }

      if (files.achievements) {
        achievementsURL = await uploadApplicationFile(currentUser.uid, job.id, files.achievements, 'achievements');
      }

      // Submit application
      const applicationData = {
        ...formData,
        resumeURL,
        certificateURL,
        achievementsURL
      };

      await submitJobApplication(currentUser.uid, job.id, applicationData);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          age: '',
          location: '',
          experience: '',
          skills: '',
          message: '',
          linkedinProfile: '',
          portfolio: ''
        });
        setFiles({ resume: null, certificate: null, achievements: null });
        setFilePreview({ resume: null, certificate: null, achievements: null });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <button className="close-btn" onClick={onClose}>&times;</button>
            <h2>Apply for this Job</h2>
          </div>
          <div className="modal-body">
            <div className="alert alert-warning">
              Please log in to apply for this job.
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  window.location.href = '/login';
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <button className="close-btn" onClick={onClose}>&times;</button>
            <h2>Application Status</h2>
          </div>
          <div className="modal-body">
            <div className="alert alert-info">
              You have already applied for this job. We'll review your application and get back to you soon.
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                className="btn btn-primary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-btn" onClick={onClose} disabled={loading}>&times;</button>
          <h2>Apply for {job?.title}</h2>
          <p className="company-name">{job?.companyName}</p>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              Application submitted successfully! We'll review it and contact you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="application-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="age">Age *</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    placeholder="Your age"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Professional Details</h3>

              <div className="form-group">
                <label htmlFor="experience">Years of Experience *</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  placeholder="e.g., 5"
                  min="0"
                  max="70"
                  value={formData.experience}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Key Skills (comma-separated) *</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  placeholder="e.g., Wiring, Circuit Installation, Safety"
                  value={formData.skills}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkedinProfile">LinkedIn Profile (Optional)</label>
                <input
                  type="url"
                  id="linkedinProfile"
                  name="linkedinProfile"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinProfile}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="portfolio">Portfolio/Website (Optional)</label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  placeholder="https://yourportfolio.com"
                  value={formData.portfolio}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Documents</h3>

              <div className="form-group">
                <label htmlFor="resume">Resume/CV (PDF or Image, Max 5MB) *</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'resume')}
                    disabled={loading}
                    required
                  />
                  <span className="file-input-label">
                    {files.resume ? files.resume.name : 'Choose Resume File'}
                  </span>
                </div>
                {filePreview.resume && (
                  <p className="file-preview-text">✓ {files.resume.name} selected</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="certificate">TESDA Certificate of Qualification (PDF or Image, Max 5MB)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="certificate"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'certificate')}
                    disabled={loading}
                  />
                  <span className="file-input-label">
                    {files.certificate ? files.certificate.name : 'Choose Certificate File (Optional)'}
                  </span>
                </div>
                {filePreview.certificate && (
                  <p className="file-preview-text">✓ {files.certificate.name} selected</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="achievements">Achievements/Additional Certifications (PDF or Image, Max 5MB)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="achievements"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'achievements')}
                    disabled={loading}
                  />
                  <span className="file-input-label">
                    {files.achievements ? files.achievements.name : 'Choose Achievements File (Optional)'}
                  </span>
                </div>
                {filePreview.achievements && (
                  <p className="file-preview-text">✓ {files.achievements.name} selected</p>
                )}
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label htmlFor="message">Cover Letter / Additional Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us why you're interested in this position and why you're a great fit..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;
