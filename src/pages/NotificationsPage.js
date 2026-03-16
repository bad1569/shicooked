import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserNotifications, markNotificationAsRead, deleteNotification } from '../services/notificationService';
import '../styles/notificationsPage.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'reviewed', 'accepted', 'rejected'
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [markAsReadLoading, setMarkAsReadLoading] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const userNotifications = await getUserNotifications(currentUser.uid);
        setNotifications(userNotifications);
        console.log(
          '%c[INFO] Notifications loaded',
          'background: #2196F3; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
          { count: userNotifications.length }
        );
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser, navigate]);

  // Filter notifications
  const getFilteredNotifications = () => {
    if (filter === 'all') {
      return notifications;
    } else if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    } else {
      return notifications.filter(n => n.status === filter);
    }
  };

  // Handle marking as read
  const handleMarkAsRead = async (notificationId, isRead) => {
    if (isRead) return; // Already read

    try {
      setMarkAsReadLoading(notificationId);
      await markNotificationAsRead(currentUser.uid, notificationId);
      
      setNotifications(prevNotifs =>
        prevNotifs.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setMarkAsReadLoading(null);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(currentUser.uid, notificationId);
        setNotifications(prevNotifs =>
          prevNotifs.filter(notif => notif.id !== notificationId)
        );
        setDeleteSuccess('Notification deleted');
        setTimeout(() => setDeleteSuccess(''), 2000);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get stats
  const acceptedCount = notifications.filter(n => n.status === 'accepted').length;
  const reviewedCount = notifications.filter(n => n.status === 'reviewed').length;
  const rejectedCount = notifications.filter(n => n.status === 'rejected').length;

  const filteredNotifications = getFilteredNotifications();

  return (
    <section className="notifications-page extra-space obj-width">
      <div className="notifications-container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1>Application Updates</h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Stay updated on the status of your job applications</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            padding: '1.5rem',
            background: '#e3f2fd',
            borderRadius: '8px',
            borderLeft: '4px solid #2196F3'
          }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Total Notifications</p>
            <h3 style={{ margin: '0.5rem 0 0 0', color: '#2196F3', fontSize: '2rem' }}>{notifications.length}</h3>
          </div>

          <div style={{
            padding: '1.5rem',
            background: '#fff3e0',
            borderRadius: '8px',
            borderLeft: '4px solid #FF9800'
          }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Under Review</p>
            <h3 style={{ margin: '0.5rem 0 0 0', color: '#FF9800', fontSize: '2rem' }}>{reviewedCount}</h3>
          </div>

          <div style={{
            padding: '1.5rem',
            background: '#e8f5e9',
            borderRadius: '8px',
            borderLeft: '4px solid #4CAF50'
          }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Accepted</p>
            <h3 style={{ margin: '0.5rem 0 0 0', color: '#4CAF50', fontSize: '2rem' }}>{acceptedCount}</h3>
          </div>

          <div style={{
            padding: '1.5rem',
            background: '#ffebee',
            borderRadius: '8px',
            borderLeft: '4px solid #f44336'
          }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Rejected</p>
            <h3 style={{ margin: '0.5rem 0 0 0', color: '#f44336', fontSize: '2rem' }}>{rejectedCount}</h3>
          </div>
        </div>

        {deleteSuccess && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '6px',
            border: '1px solid #c3e6cb'
          }}>
            ✓ {deleteSuccess}
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.75rem 1.5rem',
              background: filter === 'all' ? '#07eea9' : '#f5f5f5',
              color: filter === 'all' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: filter === 'all' ? '600' : '500',
              transition: 'all 0.3s ease'
            }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={{
              padding: '0.75rem 1.5rem',
              background: filter === 'unread' ? '#07eea9' : '#f5f5f5',
              color: filter === 'unread' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: filter === 'unread' ? '600' : '500',
              transition: 'all 0.3s ease'
            }}
          >
            Unread {unreadCount > 0 && <span style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>({unreadCount})</span>}
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            style={{
              padding: '0.75rem 1.5rem',
              background: filter === 'reviewed' ? '#07eea9' : '#f5f5f5',
              color: filter === 'reviewed' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: filter === 'reviewed' ? '600' : '500',
              transition: 'all 0.3s ease'
            }}
          >
            Under Review ({reviewedCount})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            style={{
              padding: '0.75rem 1.5rem',
              background: filter === 'accepted' ? '#07eea9' : '#f5f5f5',
              color: filter === 'accepted' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: filter === 'accepted' ? '600' : '500',
              transition: 'all 0.3s ease'
            }}
          >
            Accepted ({acceptedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            style={{
              padding: '0.75rem 1.5rem',
              background: filter === 'rejected' ? '#07eea9' : '#f5f5f5',
              color: filter === 'rejected' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: filter === 'rejected' ? '600' : '500',
              transition: 'all 0.3s ease'
            }}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.1rem', color: '#666' }}>Loading your notifications...</p>
          </div>
        )}

        {/* No Notifications */}
        {!loading && filteredNotifications.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '1.2rem', color: '#999', marginBottom: '1rem' }}>
              {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
            </p>
            <p style={{ color: '#999' }}>
              {filter === 'all' && 'When you apply for jobs, you\'ll receive updates here.'}
              {filter === 'unread' && 'All notifications have been read. Great job staying updated!'}
              {filter !== 'all' && filter !== 'unread' && `No applications with "${filter}" status yet.`}
            </p>
            <button
              onClick={() => navigate('/jobs')}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: '#07eea9',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Browse Jobs
            </button>
          </div>
        )}

        {/* Notifications List */}
        {!loading && filteredNotifications.length > 0 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                style={{
                  padding: '1.5rem',
                  border: `2px solid ${notification.read ? '#eee' : '#07eea9'}`,
                  borderRadius: '8px',
                  background: notification.read ? '#f9f9f9' : '#fffaf0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => !notification.read && handleMarkAsRead(notification.id, notification.read)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#333' }}>
                      {notification.jobTitle}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background: notification.status === 'reviewed' ? '#fff3e0' : 
                                   notification.status === 'accepted' ? '#e8f5e9' : '#ffebee',
                        color: notification.status === 'reviewed' ? '#07eea9' : 
                               notification.status === 'accepted' ? '#4CAF50' : '#f44336'
                      }}>
                        {notification.status === 'reviewed' && '⏳ Under Review'}
                        {notification.status === 'accepted' && '✓ Accepted'}
                        {notification.status === 'rejected' && '✕ Rejected'}
                      </span>
                      <span style={{ color: '#999', fontSize: '0.9rem' }}>
                        {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!notification.read && (
                        <span style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '4px',
                          background: '#07eea9',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          NEW
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  borderLeft: `4px solid ${notification.status === 'reviewed' ? '#FF9800' : 
                                           notification.status === 'accepted' ? '#4CAF50' : '#f44336'}`
                }}>
                  <p style={{ margin: 0, color: '#555', lineHeight: '1.6' }}>
                    {notification.message}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id, notification.read);
                      }}
                      disabled={markAsReadLoading === notification.id}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#e0e0e0',
                        color: '#333',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: markAsReadLoading === notification.id ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        opacity: markAsReadLoading === notification.id ? 0.6 : 1
                      }}
                    >
                      {markAsReadLoading === notification.id ? 'Marking...' : 'Mark as Read'}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#ffebee',
                      color: '#f44336',
                      border: '1px solid #ffcdd2',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NotificationsPage;
