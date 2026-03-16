import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobsContext';
import { reportAdminAccessDenial } from '../utils/adminUtils';
import { getJobApplications, updateApplicationStatus } from '../services/applicationService';
import { getAllJobRequests, updateJobRequestStatus } from '../services/jobRequestService';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';

const AdminPage = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logoutFromAdmin, authenticateAsAdmin } = useAuth();
  const { jobs, addJob, updateJob, deleteJob, loading } = useJobs();
  
  // All state hooks must be declared at the top level - before any conditional returns
  const [accessDenied, setAccessDenied] = useState(false);
  const [adminAuthRefresh, setAdminAuthRefresh] = useState(false);
  const [loggingOutFromAdmin, setLoggingOutFromAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    rate: '',
    type: 'Fulltime',
    companyName: '',
    location: '',
    vacancy: '',
    hours: '',
    description: '',
    workplace: 'On-site',
    education: '',
    experience: '',
    skills: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Application management states
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'applications', or 'requests'
  const [selectedApplicationJob, setSelectedApplicationJob] = useState('all'); // Filter by job title
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [applicationStatusError, setApplicationStatusError] = useState('');
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null); // Track which app is being updated
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');

  // Job Requests management states
  const [jobRequests, setJobRequests] = useState([]);
  const [jobRequestsLoading, setJobRequestsLoading] = useState(false);
  const [selectedRequestStatus, setSelectedRequestStatus] = useState('all');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestStatusError, setRequestStatusError] = useState('');

  const handleAdminLogout = async () => {
    try {
      setLoggingOutFromAdmin(true);
      await logoutFromAdmin();
      navigate('/');
    } catch (err) {
      console.error('Error logging out from admin:', err);
    } finally {
      setLoggingOutFromAdmin(false);
    }
  };

  // Check if user is admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    console.log(
      '%c[INFO] AdminPage Auth Status',
      'background: #2196F3; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      {
        isLoggedIn: !!currentUser,
        userEmail: currentUser?.email,
        isAdmin: userProfile?.role === 'admin',
        userRole: userProfile?.role,
        userProfileData: userProfile
      }
    );

    if (userProfile?.role === 'admin') {
      // User is admin, log successful access
      console.log(
        '%c[SUCCESS] ADMIN ACCESS GRANTED',
        'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        {
          adminEmail: currentUser.email,
          timestamp: new Date().toISOString()
        }
      );
    }
  }, [currentUser, userProfile, navigate]);

  // Watch for admin role changes
  useEffect(() => {
    console.log(
      '%c[UPDATE] UserProfile Updated',
      'background: #FF9800; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      {
        hasAdminRole: userProfile?.role === 'admin',
        currentRole: userProfile?.role,
        fullProfile: userProfile
      }
    );
  }, [userProfile]);

  // Force re-evaluate rendering when admin auth changes
  useEffect(() => {
    console.log(
      '%c[REFRESH] FORCE RE-EVALUATE: Admin Auth Refresh Triggered',
      'background: #FF6B6B; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      {
        currentUserRole: userProfile?.role,
        isAdmin: userProfile?.role === 'admin',
        userEmail: currentUser?.email,
        adminAuthRefresh: adminAuthRefresh
      }
    );
  }, [adminAuthRefresh]);

  // Fetch all applications organized by job
  useEffect(() => {
    const fetchAllApplications = async () => {
      if (userProfile?.role !== 'admin') return;
      
      try {
        setApplicationsLoading(true);
        const allApps = [];
        
        // Fetch applications for each job
        for (const job of jobs) {
          try {
            const jobApps = await getJobApplications(job.id);
            allApps.push(...jobApps.map(app => ({
              ...app,
              jobTitle: job.title,
              jobId: job.id
            })));
          } catch (err) {
            console.error(`Error fetching applications for job ${job.id}:`, err);
          }
        }
        
        setApplications(allApps);
        console.log(
          '%c[SUCCESS] Applications loaded',
          'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
          { totalApplications: allApps.length }
        );
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setApplicationsLoading(false);
      }
    };

    if (activeTab === 'applications') {
      fetchAllApplications();
    }
  }, [jobs, userProfile?.role, activeTab]);

  // Fetch all job requests
  useEffect(() => {
    const fetchJobRequests = async () => {
      if (userProfile?.role !== 'admin') return;

      try {
        setJobRequestsLoading(true);
        const requests = await getAllJobRequests();
        setJobRequests(requests);
        console.log(
          '%c[SUCCESS] Job requests loaded',
          'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
          { totalRequests: requests.length }
        );
      } catch (err) {
        console.error('Error fetching job requests:', err);
        setRequestStatusError('Failed to load job requests');
      } finally {
        setJobRequestsLoading(false);
      }
    };

    if (activeTab === 'requests') {
      fetchJobRequests();
    }
  }, [userProfile?.role, activeTab]);

  // Re-evaluate on auth refresh to force re-render
  useEffect(() => {
    // This hook is just to trigger a re-render when adminAuthRefresh changes
  }, [adminAuthRefresh]);

  // Handle job request status update
  const handleRequestStatusUpdate = async (userId, requestId, newStatus, notes = '') => {
    try {
      setUpdatingRequestId(requestId);
      setRequestStatusError('');
      await updateJobRequestStatus(userId, requestId, newStatus, notes);
      
      // Update local state
      setJobRequests((prev) =>
        prev.map((req) =>
          req.id === requestId && req.userId === userId
            ? { ...req, status: newStatus, adminNotes: notes }
            : req
        )
      );

      setRequestMessage(`✓ Request marked as ${newStatus} & user notified`);
      setTimeout(() => setRequestMessage(''), 3000);
    } catch (err) {
      setRequestStatusError(err.message || 'Failed to update request status');
      console.error('Error updating request status:', err);
    } finally {
      setUpdatingRequestId(null);
    }
  };

  // Show access denied message
  if (accessDenied) {
    return (
      <section className="admin-access-denied" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h1 style={{ color: '#f44336', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
          You do not have permission to access the admin panel.
        </p>
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          Redirecting to home page...
        </p>
      </section>
    );
  }

  // Handle admin login (for non-admin users)
  const handleAdminCredentialsSubmit = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);

    try {
      console.log(
        '%c[AUTH] Attempting admin authentication',
        'background: #673AB7; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        {
          email: adminEmail,
          timestamp: new Date().toISOString()
        }
      );

      const result = await authenticateAsAdmin(adminEmail, adminPassword);
      
      console.log(
        '%c[SUCCESS] Admin authentication successful!',
        'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        {
          resultRole: result?.role,
          resultEmail: result?.email,
          fullResult: result
        }
      );

      // Force refresh profile from database to ensure latest role
      if (currentUser) {
        try {
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const latestProfile = snapshot.val();
            console.log(
              '%c[REFRESH] PROFILE REFRESHED FROM DATABASE',
              'background: #00BCD4; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
              {
                role: latestProfile.role,
                email: latestProfile.email,
                isAdmin: latestProfile.role === 'admin'
              }
            );
          }
        } catch (refreshErr) {
          console.error('Error refreshing profile:', refreshErr);
        }
      }

      setAdminEmail('');
      setAdminPassword('');
      
      // Trigger a re-check of admin status
      setAdminAuthRefresh(prev => !prev);
      
      // Component should re-render with new userProfile from context
    } catch (err) {
      console.error(
        '%c[ERROR] Admin authentication failed',
        'background: #f44336; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        {
          error: err.message,
          email: adminEmail,
          timestamp: new Date().toISOString()
        }
      );
      setAdminLoginError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  // Handle application status update
  const handleApplicationStatusUpdate = async (jobId, applicationId, newStatus, jobTitle) => {
    try {
      setApplicationStatusError('');
      setStatusUpdateSuccess('');
      setUpdatingApplicationId(applicationId);
      
      await updateApplicationStatus(jobId, applicationId, newStatus, jobTitle);
      
      // Update local state
      setApplications(prevApps =>
        prevApps.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      
      const statusMessage = newStatus === 'reviewed' 
        ? 'Application marked as reviewed & user notified'
        : newStatus === 'accepted'
        ? 'Application accepted & user notified'
        : newStatus === 'rejected'
        ? 'Application rejected & user notified'
        : 'Status updated';
      
      setStatusUpdateSuccess(statusMessage);
      
      setTimeout(() => setStatusUpdateSuccess(''), 3000);
      
      console.log(
        '%c[SUCCESS] Application status updated & notification sent',
        'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        { applicationId, newStatus, jobTitle }
      );
    } catch (err) {
      setApplicationStatusError('Failed to update application status');
      console.error('Error updating application status:', err);
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  // Get applications filtered by job category
  const getApplicationsByCategory = () => {
    if (selectedApplicationJob === 'all') {
      return applications;
    }
    return applications.filter(app => app.jobTitle === selectedApplicationJob);
  };

  // Get unique job titles from applications
  const uniqueJobTitles = [...new Set(applications.map(app => app.jobTitle))];

  // Show admin login form if user is not admin
  const shouldShowLoginForm = !accessDenied && currentUser && userProfile?.role !== 'admin';
  
  console.log(
    '%c[DEBUG] Render Decision Logic',
    'background: #9C27B0; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
    {
      accessDenied: accessDenied,
      currentUser: !!currentUser,
      userEmail: currentUser?.email,
      userRole: userProfile?.role,
      roleIsAdmin: userProfile?.role === 'admin',
      shouldShowLoginForm: shouldShowLoginForm,
      willShowAdminPanel: currentUser && userProfile?.role === 'admin' && !accessDenied,
      adminAuthRefresh: adminAuthRefresh
    }
  );

  if (shouldShowLoginForm) {
    console.log(
      '%c[RENDER] Admin Login Form',
      'background: #FF9800; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      {
        reason: 'User is logged in but does not have admin role yet',
        userRole: userProfile?.role,
        needsCredentials: true
      }
    );
    return (
      <section className="admin-section extra-space obj-width">
        <div className="admin-container">
          <div style={{
            maxWidth: '500px',
            margin: '3rem auto',
            padding: '2rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>Admin Access Required</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Enter admin credentials to proceed to the admin panel.
            </p>

            {adminLoginError && (
              <div style={{
                padding: '1rem',
                marginBottom: '1rem',
                background: '#f8d7da',
                color: '#721c24',
                border: '1px solid #f5c6cb',
                borderRadius: '6px'
              }}>
                {adminLoginError}
              </div>
            )}

            <form onSubmit={handleAdminCredentialsSubmit} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter admin email"
                  disabled={adminLoginLoading}
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    border: '2px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Admin Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  disabled={adminLoginLoading}
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    border: '2px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={adminLoginLoading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: adminLoginLoading ? '#ccc' : '#07eea9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: adminLoginLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {adminLoginLoading ? 'Authenticating...' : 'Access Admin Panel'}
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', color: '#999', fontSize: '0.85rem' }}>
              This is a restricted area. Only authorized administrators can proceed.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // If we reach here, user is admin
  console.log(
    '%c[RENDER] Admin Panel With Full Job Management',
    'background: #4CAF50; color: white; padding: 8px 12px; border-radius: 3px; font-weight: bold; font-size: 14px;',
    {
      adminEmail: currentUser?.email,
      adminRole: userProfile?.role,
      canAddJobs: true,
      canEditJobs: true,
      canDeleteJobs: true,
      jobsLoaded: jobs.length,
      timestamp: new Date().toISOString()
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      rate: '',
      type: 'Fulltime',
      companyName: '',
      location: '',
      vacancy: '',
      hours: '',
      description: '',
      workplace: 'On-site',
      education: '',
      experience: '',
      skills: ''
    });
    setEditingJobId(null);
  };

  const handleEditJob = (job) => {
    setFormData({
      title: job.title,
      rate: job.rate,
      type: job.type,
      companyName: job.companyName,
      location: job.location,
      vacancy: job.vacancy,
      hours: job.hours,
      description: job.description,
      workplace: job.workplace,
      education: job.education,
      experience: job.experience,
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || ''
    });
    setEditingJobId(job.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.companyName || !formData.location) {
      setMessage({ text: 'Please fill in all required fields', type: 'error' });
      return;
    }

    const jobData = {
      icon: getIconForJob(formData.title),
      image: getImageForJob(formData.title),
      title: formData.title,
      rate: formData.rate,
      type: formData.type,
      companyName: formData.companyName,
      location: formData.location,
      vacancy: formData.vacancy,
      hours: formData.hours,
      description: formData.description,
      workplace: formData.workplace,
      education: formData.education,
      experience: formData.experience,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
    };

    try {
      setIsSubmitting(true);
      if (editingJobId) {
        await updateJob(editingJobId, jobData);
        setMessage({ text: 'Job updated successfully!', type: 'success' });
      } else {
        await addJob(jobData);
        setMessage({ text: 'Job added successfully!', type: 'success' });
      }
      resetForm();
      setTimeout(() => {
        setShowForm(false);
        setMessage({ text: '', type: '' });
      }, 2000);
    } catch (err) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        setIsSubmitting(true);
        await deleteJob(jobId);
        setMessage({ text: 'Job deleted successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 2000);
      } catch (err) {
        setMessage({ text: `Error deleting job: ${err.message}`, type: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getIconForJob = (title) => {
    const icons = {
      electrician: '[E]',
      plumbing: '[P]',
      carpentry: '[C]',
      welding: '[W]',
      mechanical: '[M]',
      default: '[J]'
    };
    const titleLower = title.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (titleLower.includes(key)) return icon;
    }
    return icons.default;
  };

  const getImageForJob = (title) => {
    const images = {
      electrician: '/images/sourced/electrical.png',
      plumbing: '/images/sourced/plumming.png',
      carpentry: '/images/sourced/carpentry.png',
      welding: '/images/sourced/smaw.png',
      mechanical: '/images/sourced/machine.png',
      default: '/images/sourced/logo.png'
    };
    const titleLower = title.toLowerCase();
    for (const [key, image] of Object.entries(images)) {
      if (titleLower.includes(key)) return image;
    }
    return images.default;
  };

  return (
    <section className="admin-section extra-space obj-width">
      <div className="admin-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <div>
            <h1>Admin Panel</h1>
            <p>Manage job listings for Alacritas</p>
          </div>
          <button
            onClick={handleAdminLogout}
            disabled={loggingOutFromAdmin}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loggingOutFromAdmin ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              opacity: loggingOutFromAdmin ? 0.7 : 1,
              transition: 'all 0.3s ease',
              minWidth: '150px',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!loggingOutFromAdmin) e.target.style.background = '#d32f2f';
            }}
            onMouseLeave={(e) => {
              if (!loggingOutFromAdmin) e.target.style.background = '#f44336';
            }}
            title="Exit admin panel and return to user account"
          >
            {loggingOutFromAdmin ? 'Exiting Admin...' : '✕ Exit Admin'}
          </button>
        </div>

        <hr style={{ margin: '1.5rem 0', borderColor: '#eee' }} />

        {/* Admin Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'jobs' ? '#07eea9' : '#f5f5f5',
              color: activeTab === 'jobs' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === 'jobs' ? '600' : '500',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            Jobs Management
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'applications' ? '#07eea9' : '#f5f5f5',
              color: activeTab === 'applications' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === 'applications' ? '600' : '500',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            Job Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'requests' ? '#07eea9' : '#f5f5f5',
              color: activeTab === 'requests' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === 'requests' ? '600' : '500',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            Job Requests ({jobRequests.length})
          </button>
        </div>

        {/* Jobs Management Tab */}
        {activeTab === 'jobs' && (
        <div className="admin-content">
          <div className="jobs-list">
            <h2>Current Jobs ({jobs.length})</h2>
            
            <button 
              className="add-job-btn"
              onClick={() => {
                if (showForm && !editingJobId) {
                  setShowForm(false);
                } else {
                  resetForm();
                  setShowForm(!showForm);
                }
              }}
              disabled={isSubmitting}
            >
              {showForm && !editingJobId ? '✕ Close Form' : '+ Add New Job'}
            </button>

            {message.text && (
              <div style={{
                padding: '1rem',
                marginTop: '1rem',
                borderRadius: '6px',
                background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                {message.text}
              </div>
            )}

            {loading ? (
              <p>Loading jobs...</p>
            ) : (
              <div className="jobs-table-container">
                <table className="jobs-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Rate</th>
                      <th>Vacancy</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.length > 0 ? (
                      jobs.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <img src={job.image} alt={job.title} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                              {job.title}
                            </div>
                          </td>
                          <td>{job.companyName}</td>
                          <td>{job.location}</td>
                          <td><span className="badge">{job.type}</span></td>
                          <td>{job.rate}</td>
                          <td>{job.vacancy}</td>
                          <td>
                            <button 
                              onClick={() => handleEditJob(job)}
                              className="action-btn edit-btn"
                              disabled={isSubmitting}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="action-btn delete-btn"
                              disabled={isSubmitting}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No jobs found. Add your first job!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {showForm && (
            <div className="add-job-form-container">
              <h2>{editingJobId ? 'Edit Job' : 'Add New Job'}</h2>
              
              <form onSubmit={handleSubmit} className="add-job-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Job Title *</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {formData.title && (
                        <img 
                          src={getImageForJob(formData.title)} 
                          alt={formData.title}
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        />
                      )}
                      <select
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        style={{
                          flex: 1,
                          padding: '0.85rem',
                          border: '2px solid #e8e8e8',
                          borderRadius: '6px',
                          fontSize: '1rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Select a job title...</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="Welding">Welding (SMAW)</option>
                        <option value="Mechanical">Mechanical</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="companyName">Company Name *</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      placeholder="e.g., Company Name"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      placeholder="e.g., Manila, Metro Manila"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rate">Salary Rate</label>
                    <input
                      type="text"
                      id="rate"
                      name="rate"
                      placeholder="e.g., PHP 800-1500/m"
                      value={formData.rate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Job Type</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="Fulltime">Full Time</option>
                      <option value="Parttime">Part Time</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="vacancy">Vacancy</label>
                    <input
                      type="number"
                      id="vacancy"
                      name="vacancy"
                      placeholder="Number of positions"
                      value={formData.vacancy}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="hours">Hours/Week</label>
                    <input
                      type="text"
                      id="hours"
                      name="hours"
                      placeholder="e.g., 40-50h/week"
                      value={formData.hours}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="workplace">Workplace</label>
                    <select
                      id="workplace"
                      name="workplace"
                      value={formData.workplace}
                      onChange={handleChange}
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="education">Education Requirement</label>
                    <input
                      type="text"
                      id="education"
                      name="education"
                      placeholder="e.g., Trade Certification"
                      value={formData.education}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Experience Required</label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      placeholder="e.g., 3+ years"
                      value={formData.experience}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Job Description</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Detailed job description..."
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="skills">Skills (Comma Separated)</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    placeholder="e.g., Wiring, Circuit Installation, Safety"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : (editingJobId ? 'Update Job' : 'Add Job')}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
        <div className="applications-content" style={{ marginTop: '2rem' }}>
          {applicationsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading applications...</p>
            </div>
          ) : (
            <>
              {/* Category Filter */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ marginRight: '1rem', fontWeight: '600' }}>Filter by Job Category:</label>
                <select
                  value={selectedApplicationJob}
                  onChange={(e) => setSelectedApplicationJob(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Categories ({applications.length})</option>
                  {uniqueJobTitles.map(title => (
                    <option key={title} value={title}>
                      {title} ({applications.filter(a => a.jobTitle === title).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Applications List */}
              {applications.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  background: '#f5f5f5',
                  borderRadius: '8px'
                }}>
                  <p style={{ fontSize: '1.1rem', color: '#666' }}>No applications yet</p>
                </div>
              ) : (
                <div>
                  {getApplicationsByCategory().length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem 2rem',
                      background: '#f5f5f5',
                      borderRadius: '8px'
                    }}>
                      <p style={{ fontSize: '1.1rem', color: '#666' }}>No applications for this category</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      {getApplicationsByCategory().map(app => (
                        <div
                          key={app.id}
                          style={{
                            border: '2px solid #eee',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            background: 'white'
                          }}
                        >
                          {/* Application Header */}
                          <div
                            style={{
                              padding: '1rem',
                              background: '#f9f9f9',
                              borderBottom: '2px solid #eee',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onClick={() => setExpandedApplication(expandedApplication === app.id ? null : app.id)}
                          >
                            <div>
                              <h3 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.1rem' }}>{app.fullName}</h3>
                              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                                Applied for: <strong>{app.jobTitle}</strong> • {new Date(app.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                background: app.status === 'accepted' ? '#d4edda' : app.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                                color: app.status === 'accepted' ? '#155724' : app.status === 'rejected' ? '#721c24' : '#856404'
                              }}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                              <span style={{ fontSize: '1.2rem' }}>{expandedApplication === app.id ? '▼' : '▶'}</span>
                            </div>
                          </div>

                          {/* Application Details */}
                          {expandedApplication === app.id && (
                            <div style={{ padding: '1.5rem' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                    <strong>Email:</strong> {app.email}
                                  </p>
                                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                    <strong>Phone:</strong> {app.phone}
                                  </p>
                                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                    <strong>Age:</strong> {app.age}
                                  </p>
                                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                    <strong>Location:</strong> {app.location}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                    <strong>Experience:</strong> {app.experience} years
                                  </p>
                                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                    <strong>Skills:</strong> {app.skills}
                                  </p>
                                  {app.linkedinProfile && (
                                    <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                      <strong>LinkedIn:</strong> <a href={app.linkedinProfile} target="_blank" rel="noopener noreferrer" style={{ color: '#07eea9' }}>View Profile</a>
                                    </p>
                                  )}
                                  {app.portfolio && (
                                    <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                      <strong>Portfolio:</strong> <a href={app.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: '#07eea9' }}>View Portfolio</a>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {app.message && (
                                <div style={{ 
                                  marginBottom: '1.5rem',
                                  padding: '1rem',
                                  background: '#f9f9f9',
                                  borderRadius: '6px',
                                  borderLeft: '4px solid #07eea9'
                                }}>
                                  <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
                                    <strong>Cover Letter:</strong><br />
                                    {app.message}
                                  </p>
                                </div>
                              )}

                              {(app.resumeURL || app.certificateURL || app.achievementsURL) && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#333' }}>Documents:</p>
                                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {app.resumeURL && (
                                      <a
                                        href={app.resumeURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          padding: '0.5rem 1rem',
                                          background: '#4CAF50',
                                          color: 'white',
                                          borderRadius: '6px',
                                          textDecoration: 'none',
                                          fontSize: '0.9rem',
                                          fontWeight: '600'
                                        }}
                                      >
                                        📄 Download Resume
                                      </a>
                                    )}
                                    {app.certificateURL && (
                                      <a
                                        href={app.certificateURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          padding: '0.5rem 1rem',
                                          background: '#2196F3',
                                          color: 'white',
                                          borderRadius: '6px',
                                          textDecoration: 'none',
                                          fontSize: '0.9rem',
                                          fontWeight: '600'
                                        }}
                                      >
                                        📋 Download Certificate
                                      </a>
                                    )}
                                    {app.achievementsURL && (
                                      <a
                                        href={app.achievementsURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          padding: '0.5rem 1rem',
                                          background: '#FF9800',
                                          color: 'white',
                                          borderRadius: '6px',
                                          textDecoration: 'none',
                                          fontSize: '0.9rem',
                                          fontWeight: '600'
                                        }}
                                      >
                                        🏆 Download Achievements
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Status Update */}
                              <div style={{ borderTop: '2px solid #eee', paddingTop: '1.5rem' }}>
                                <p style={{ margin: '0 0 1rem 0', fontWeight: '600', color: '#333' }}>Update Status:</p>
                                {applicationStatusError && (
                                  <p style={{ color: '#f44336', marginBottom: '1rem', padding: '0.75rem', background: '#ffebee', borderRadius: '6px' }}>{applicationStatusError}</p>
                                )}
                                {statusUpdateSuccess && (
                                  <p style={{ color: '#155724', marginBottom: '1rem', padding: '0.75rem', background: '#d4edda', borderRadius: '6px' }}>✓ {statusUpdateSuccess}</p>
                                )}
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                  {['pending', 'reviewed', 'accepted', 'rejected'].map(status => (
                                    <button
                                      key={status}
                                      onClick={() => handleApplicationStatusUpdate(app.jobId, app.id, status, app.jobTitle)}
                                      disabled={updatingApplicationId === app.id}
                                      style={{
                                        padding: '0.5rem 1rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: updatingApplicationId === app.id ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        background: app.status === status ? '#07eea9' : '#e0e0e0',
                                        color: app.status === status ? 'white' : '#333',
                                        transition: 'all 0.3s ease',
                                        opacity: updatingApplicationId === app.id ? 0.6 : 1
                                      }}
                                    >
                                      {updatingApplicationId === app.id ? 'Updating...' : (status.charAt(0).toUpperCase() + status.slice(1))}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        )}

        {/* Job Requests Tab */}
        {activeTab === 'requests' && (
        <div className="requests-content" style={{ marginTop: '2rem' }}>
          {requestStatusError && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              background: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb'
            }}>
              {requestStatusError}
            </div>
          )}
          {requestMessage && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              background: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb'
            }}>
              {requestMessage}
            </div>
          )}

          {jobRequestsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading job requests...</p>
            </div>
          ) : jobRequests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              color: '#999'
            }}>
              <p>No job requests yet</p>
            </div>
          ) : (
            <>
              {/* Status Filter */}
              <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['all', 'pending', 'under_review', 'accepted', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedRequestStatus(status)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: selectedRequestStatus === status ? '#07eea9' : '#f5f5f5',
                      color: selectedRequestStatus === status ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: selectedRequestStatus === status ? '600' : '500',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')} (
                    {jobRequests.filter(r => status === 'all' ? true : r.status === status).length})
                  </button>
                ))}
              </div>

              {/* Requests List */}
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {jobRequests
                  .filter(req => selectedRequestStatus === 'all' || req.status === selectedRequestStatus)
                  .map((request) => (
                    <div
                      key={`${request.userId}-${request.id}`}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        background: 'white',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{request.title}</h3>
                          <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                            Location: <strong>{request.location}</strong>
                          </p>
                          <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                            Worker Type: <strong>
                              {request.skillLevel === 'laborer' ? 'Laborer' : request.skillLevel === 'skilled' ? 'Skilled Worker' : 'Specialist'}
                            </strong>
                          </p>
                        </div>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          backgroundColor:
                            request.status === 'pending' ? '#FFB433' :
                            request.status === 'under_review' ? '#2196F3' :
                            request.status === 'accepted' ? '#4CAF50' :
                            '#F44336'
                        }}>
                          {request.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>

                      <div style={{
                        background: '#f9f9f9',
                        padding: '1rem',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                        borderLeft: '4px solid #667eea'
                      }}>
                        <p style={{ margin: '0.5rem 0', color: '#555' }}><strong>Description:</strong> {request.description}</p>
                        <p style={{ margin: '0.5rem 0', color: '#555' }}>
                          <strong>Budget:</strong> ₱{request.estimatedBudget?.toLocaleString() || 'N/A'} 
                          ({request.estimatedDays} days @ ₱{request.dailyWage?.toLocaleString() || 'N/A'}/day)
                        </p>
                        {request.images && request.images.length > 0 && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <strong>Images: </strong>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                              {request.images.slice(0, 5).map((img, idx) => (
                                <img key={idx} src={img} alt={`Request ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                              ))}
                              {request.images.length > 5 && (
                                <div style={{ width: '80px', height: '80px', background: '#ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  +{request.images.length - 5}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {request.adminNotes && (
                        <div style={{
                          background: '#fff3e0',
                          padding: '1rem',
                          borderRadius: '6px',
                          marginBottom: '1rem',
                          borderLeft: '4px solid #ff9800'
                        }}>
                          <strong style={{ color: '#e65100' }}>Admin Notes:</strong>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#555' }}>{request.adminNotes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['pending', 'under_review', 'accepted', 'rejected'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleRequestStatusUpdate(request.userId, request.id, status)}
                            disabled={updatingRequestId === request.id}
                            style={{
                              padding: '0.75rem 1rem',
                              background:
                                status === 'pending' ? '#FFB433' :
                                status === 'under_review' ? '#2196F3' :
                                status === 'accepted' ? '#4CAF50' :
                                '#F44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: updatingRequestId === request.id ? 'not-allowed' : 'pointer',
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              opacity: updatingRequestId === request.id ? 0.6 : 1,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {updatingRequestId === request.id
                              ? 'Updating...'
                              : `Mark as ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}`}
                          </button>
                        ))}
                      </div>

                      <p style={{ margin: '1rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>
                        Posted {new Date(request.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
        )}
      </div>
    </section>
  );
};

export default AdminPage;
