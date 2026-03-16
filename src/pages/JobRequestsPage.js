import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserJobRequests, deleteJobRequest } from '../services/jobRequestService';
import '../styles/jobRequestsPage.css';

const JobRequestsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchJobRequests();
  }, [currentUser, navigate]);

  const fetchJobRequests = async () => {
    try {
      setLoading(true);
      const data = await getUserJobRequests(currentUser.uid);
      setRequests(data);
      setError('');
    } catch (err) {
      console.error('Error fetching job requests:', err);
      setError('Failed to load job requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        setDeletingId(requestId);
        await deleteJobRequest(currentUser.uid, requestId);
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      } catch (err) {
        setError(err.message || 'Failed to delete request');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getFilteredRequests = () => {
    if (filterStatus === 'all') {
      return requests;
    }
    return requests.filter((r) => r.status === filterStatus);
  };

  const filteredRequests = getFilteredRequests();

  // Count by status
  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    under_review: requests.filter((r) => r.status === 'under_review').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFB433';
      case 'under_review':
        return '#2196F3';
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#777';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'under_review':
        return 'Under Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="job-requests-container">
      <div className="obj-width">
        <div className="page-header">
          <h1>My Job Requests</h1>
          <p>Track all your posted job requests and their status</p>
        </div>

        {error && <div className="error-message-banner">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <p>Loading your job requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="bx bxs-notepad"></i></div>
            <h2>No Job Requests Yet</h2>
            <p>You haven't posted any job requests. Start by posting your first request!</p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Go Home & Post a Request
            </button>
          </div>
        ) : (
          <>
            {/* Status Filter Tabs */}
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All
                <span className="count">{statusCounts.all}</span>
              </button>
              <button
                className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
                <span className="count">{statusCounts.pending}</span>
              </button>
              <button
                className={`filter-tab ${filterStatus === 'under_review' ? 'active' : ''}`}
                onClick={() => setFilterStatus('under_review')}
              >
                Under Review
                <span className="count">{statusCounts.under_review}</span>
              </button>
              <button
                className={`filter-tab ${filterStatus === 'accepted' ? 'active' : ''}`}
                onClick={() => setFilterStatus('accepted')}
              >
                Accepted
                <span className="count">{statusCounts.accepted}</span>
              </button>
              <button
                className={`filter-tab ${filterStatus === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilterStatus('rejected')}
              >
                Rejected
                <span className="count">{statusCounts.rejected}</span>
              </button>
            </div>

            {/* Requests Grid */}
            <div className="requests-grid">
              {filteredRequests.length === 0 ? (
                <div className="empty-filter">
                  <p>No {filterStatus} requests yet</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <div>
                        <h3>{request.title}</h3>
                        <p className="location">📍 {request.location}</p>
                      </div>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </div>

                    <p className="description">{request.description}</p>

                    {/* Request Details */}
                    <div className="request-details">
                      <div className="detail-row">
                        <span className="detail-label">Worker Type:</span>
                        <span className="detail-value">
                          {request.skillLevel === 'laborer'
                            ? 'Laborer'
                            : request.skillLevel === 'skilled'
                            ? 'Skilled Worker'
                            : 'Specialist'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Est. Days:</span>
                        <span className="detail-value">{request.estimatedDays} days</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Daily Rate:</span>
                        <span className="detail-value">
                          ₱{request.dailyWage?.toLocaleString() || 'TBD'}
                        </span>
                      </div>
                      <div className="detail-row budget">
                        <span className="detail-label">Budget:</span>
                        <strong className="detail-value">
                          ₱{request.estimatedBudget?.toLocaleString() || 'TBD'}
                        </strong>
                      </div>
                    </div>

                    {/* Images */}
                    {request.images && request.images.length > 0 && (
                      <div className="request-images">
                        {request.images.slice(0, 3).map((img, idx) => (
                          <img key={idx} src={img} alt={`Request ${idx + 1}`} />
                        ))}
                        {request.images.length > 3 && (
                          <div className="more-images">
                            +{request.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Notes */}
                    {request.adminNotes && (
                      <div className="admin-notes">
                        <strong>Admin Notes:</strong>
                        <p>{request.adminNotes}</p>
                      </div>
                    )}

                    {/* Posted Date */}
                    <p className="posted-date">
                      Posted {formatDate(request.createdAt)}
                    </p>

                    {/* Actions */}
                    <div className="request-actions">
                      {request.status === 'pending' && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(request.id)}
                          disabled={deletingId === request.id}
                        >
                          {deletingId === request.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobRequestsPage;
