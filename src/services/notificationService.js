// Application Notification Service
// Handles sending notifications to users when their application status is updated

import { db } from '../config/firebase';
import { ref, set, push, get } from 'firebase/database';

const NOTIFICATIONS_REF = 'notifications';

/**
 * Send notification to user about application status
 * @param {string} userId - User ID to notify
 * @param {string} jobTitle - Job title for context
 * @param {string} status - Application status (reviewed, accepted, rejected)
 * @param {string} message - Custom message for the user
 * @returns {Promise<Object>} - Notification data
 */
export const sendApplicationNotification = async (userId, jobTitle, status, message = '') => {
  try {
    const notificationsRef = ref(db, `${NOTIFICATIONS_REF}/${userId}`);
    const newNotificationRef = push(notificationsRef);

    let defaultMessage = '';
    let notificationType = 'info';

    switch (status) {
      case 'reviewed':
        defaultMessage = `Your application for ${jobTitle} is now under review. We're evaluating your qualifications and will get back to you soon.`;
        notificationType = 'info';
        break;
      case 'accepted':
        defaultMessage = `Congratulations! Your application for ${jobTitle} has been accepted. We'd like to move forward with you. Please check your email for next steps.`;
        notificationType = 'success';
        break;
      case 'rejected':
        defaultMessage = `Thank you for your interest in the ${jobTitle} position. Unfortunately, we've decided to move forward with other candidates. We encourage you to apply for future positions.`;
        notificationType = 'error';
        break;
      default:
        defaultMessage = `Your application status has been updated to: ${status}`;
        notificationType = 'info';
    }

    const notification = {
      notificationId: newNotificationRef.key,
      userId,
      jobTitle,
      status,
      message: message || defaultMessage,
      type: notificationType,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await set(newNotificationRef, notification);

    // Also store in user's notification count
    const userNotifCountRef = ref(db, `users/${userId}/notificationCount`);
    // This is optional - increment count for UI badge
    // We'll just store the notification for now

    console.log(
      '%c[SUCCESS] Notification sent to user',
      'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      {
        userId,
        jobTitle,
        status,
        notificationId: newNotificationRef.key
      }
    );

    return notification;
  } catch (error) {
    console.error(
      '%c[ERROR] Failed to send notification',
      'background: #f44336; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      {
        error: error.message,
        userId,
        jobTitle,
        status
      }
    );
    throw error;
  }
};

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of notifications
 */
export const getUserNotifications = async (userId) => {
  try {
    const notificationsRef = ref(db, `${NOTIFICATIONS_REF}/${userId}`);
    const snapshot = await get(notificationsRef);

    if (snapshot.exists()) {
      const notificationsData = snapshot.val();
      const notifications = Object.entries(notificationsData).map(([key, value]) => ({
        id: key,
        ...value
      }));
      return notifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const notificationRef = ref(db, `${NOTIFICATIONS_REF}/${userId}/${notificationId}`);
    const snapshot = await get(notificationRef);

    if (snapshot.exists()) {
      const notificationData = snapshot.val();
      await set(notificationRef, {
        ...notificationData,
        read: true,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Delete notification
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (userId, notificationId) => {
  try {
    const notificationRef = ref(db, `${NOTIFICATIONS_REF}/${userId}/${notificationId}`);
    await set(notificationRef, null);
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};
