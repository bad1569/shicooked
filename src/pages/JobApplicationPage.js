import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobsContext';
import { submitJobApplication, uploadApplicationFile, hasUserApplied } from '../services/applicationService';
import '../styles/jobApplicationPage.css';

const JobApplicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { getJobById } = useJobs();

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

  const job = getJobById(id);

  // Check if user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Check if user already applied
  useEffect(() => {
    const checkApplication = async () => {
      if (currentUser && job?.id) {
        const hasApplied = await hasUserApplied(currentUser.uid, job.id);
        setAlreadyApplied(hasApplied);
      }
    };

    checkApplication();
  }, [currentUser, job]);

  // Populate form with user data
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: userProfile.displayName || '',
        email: userProfile.email || ''
      }));
    }
  }, [userProfile]);

  if (!job) {
    return (
      <section className="job-application-section extra-space obj-width">
        <div className="back-button-container">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Back
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Job not found</h2>
          <p>The job you're trying to apply for doesn't exist.</p>
        </div>
      </section>
    );
  }

  if (alreadyApplied) {
    return (
      <section className="job-application-section extra-space obj-width">
        <div className="back-button-container">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Back
          </button>
        </div>
        <div className="already-applied-message">
          <h2>✓ Already Applied</h2>
          <p>You have already applied for this position: <strong>{job.title}</strong></p>
          <p>We'll review your application and contact you soon.</p>
        </div>
      </section>
    );
  }

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
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or image file (JPG, PNG)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFiles(prev => ({
        ...prev,
        [fileType]: file
      }));

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
    if (!formData.fullName || !formData.email || !formData.phone || !formData.age || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!files.resume) {
      setError('Resume/CV is required');
      return;
    }

    try {
      setLoading(true);

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

      const applicationData = {
        ...formData,
        resumeURL,
        certificateURL,
        achievementsURL
      };

      await submitJobApplication(currentUser.uid, job.id, applicationData);

      setSuccess(true);
      
      console.log(
        '%c✅ Application submitted successfully!',
        'background: #4CAF50; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold;',
        applicationData
      );

      setTimeout(() => {
        // Reset form on success
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
        navigate(`/job/${id}`);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
      console.error('Application error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="job-application-section extra-space obj-width">
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
      </div>

      <div className="application-container">
        <div className="application-header">
          <h1>Apply for {job.title}</h1>
          <p className="company-info">at {job.companyName}</p>
          <p className="application-description">
            Please provide your details below. All fields marked with * are required.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <strong>Success!</strong> Your application has been submitted successfully. Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="application-form-page">
          {/* Personal Information Section */}
          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
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
                  placeholder="your@email.com"
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
                  placeholder="+1 (555) 123-4567"
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

            <div className="form-group full-width">
              <label htmlFor="location">Location / Address *</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="City, Province, Country"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Professional Details Section */}
          <div className="form-section">
            <h2>Professional Details</h2>

            <div className="form-row">
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
                  placeholder="e.g., Leadership, Project Management, Communication"
                  value={formData.skills}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row">
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
          </div>

          {/* Document Upload Section */}
          <div className="form-section">
            <h2>Documents & Certificates</h2>

            <div className="form-group full-width">
              <label htmlFor="resume">Resume/CV (PDF or Image, Max 5MB) *</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'resume')}
                  disabled={loading}
                  required
                />
                <span className="file-input-label">
                  {files.resume ? `✓ ${files.resume.name}` : 'Choose Resume/CV File'}
                </span>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="certificate">TESDA Certificate (PDF or Image, Max 5MB)</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="certificate"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'certificate')}
                  disabled={loading}
                />
                <span className="file-input-label">
                  {files.certificate ? `✓ ${files.certificate.name}` : 'Choose TESDA Certificate (Optional)'}
                </span>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="achievements">Achievements/Awards (PDF or Image, Max 5MB)</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="achievements"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'achievements')}
                  disabled={loading}
                />
                <span className="file-input-label">
                  {files.achievements ? `✓ ${files.achievements.name}` : 'Choose Achievement File (Optional)'}
                </span>
              </div>
            </div>
          </div>

          {/* Cover Letter Section */}
          <div className="form-section">
            <h2>Cover Letter</h2>
            
            <div className="form-group full-width">
              <label htmlFor="message">Why are you interested in this position?</label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell us why you're a great fit for this position..."
                rows="6"
                value={formData.message}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default JobApplicationPage;
