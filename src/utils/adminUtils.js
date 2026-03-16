/**
 * Admin Authentication Utilities
 * Handles admin verification and detailed error logging
 */

import { ref, get, set } from 'firebase/database';
import { db } from '../config/firebase';

const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'testadmin@gmail.com',
  password: 'testadmin'
};

/**
 * Initialize admin credentials in database if they don't exist
 * @returns {Promise<object>} Admin credentials
 */
export const initializeAdminCredentials = async () => {
  try {
    const adminRef = ref(db, 'admin');
    const snapshot = await get(adminRef);
    
    if (!snapshot.exists()) {
      // Create default admin credentials
      await set(adminRef, DEFAULT_ADMIN_CREDENTIALS);
      console.log(
        '%c✅ Admin credentials initialized in database',
        'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        DEFAULT_ADMIN_CREDENTIALS
      );
      return DEFAULT_ADMIN_CREDENTIALS;
    } else {
      console.log(
        '%c✅ Admin credentials already exist in database',
        'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        snapshot.val()
      );
      return snapshot.val();
    }
  } catch (err) {
    console.error('Error initializing admin credentials:', err);
    return DEFAULT_ADMIN_CREDENTIALS; // Fallback to default
  }
};

/**
 * Fetch admin credentials from Firebase Realtime Database
 * @returns {Promise<object>} Admin credentials from database
 */
export const getAdminCredentialsFromDatabase = async () => {
  try {
    const adminRef = ref(db, 'admin');
    const snapshot = await get(adminRef);
    
    if (snapshot.exists()) {
      const creds = snapshot.val();
      console.log(
        '%c📋 Admin credentials fetched from database',
        'background: #2196F3; color: white; padding: 3px 6px; border-radius: 3px; font-weight: bold;',
        {
          email: creds?.email,
          hasPassword: !!creds?.password,
          timestamp: new Date().toISOString()
        }
      );
      return creds;
    } else {
      console.warn(
        '%c⚠️ Admin credentials not found in database - initializing...',
        'background: #ff9800; color: white; padding: 3px 6px; border-radius: 3px; font-weight: bold;'
      );
      // Try to initialize
      return await initializeAdminCredentials();
    }
  } catch (err) {
    console.error(
      '%c❌ Error fetching admin credentials from database:',
      'background: #f44336; color: white; padding: 3px 6px; border-radius: 3px; font-weight: bold;',
      err
    );
    console.log('Falling back to default credentials');
    return DEFAULT_ADMIN_CREDENTIALS;
  }
};

/**
 * Verify if provided credentials are valid admin credentials (from Firebase)
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<boolean>} True if valid admin credentials
 */
export const isValidAdminCredentials = async (email, password) => {
  try {
    const adminRef = ref(db, 'admin');
    const snapshot = await get(adminRef);
    
    if (!snapshot.exists()) {
      console.error(
        '%c[ADMIN AUTH FAILED]',
        'background: #f44336; color: white; padding: 3px 6px; border-radius: 3px; font-weight: bold;',
        {
          timestamp: new Date().toISOString(),
          failureReason: 'Admin credentials not found in database',
          hint: 'Make sure admin node exists in Firebase Realtime Database'
        }
      );
      return false;
    }

    const adminData = snapshot.val();
    let isValid = false;
    let matchedAdmin = null;

    // DEBUG: Log the actual structure from Firebase
    console.log(
      '%c📊 ADMIN DATA FROM FIREBASE:',
      'background: #2196F3; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
      JSON.stringify(adminData, null, 2)
    );
    console.log('%cKeys in admin object:', 'color: #2196F3; font-weight: bold;', Object.keys(adminData));

    // Handle new format: multiple admins (admin1, admin2, etc.)
    if (adminData.admin1 !== undefined || adminData.admin2 !== undefined) {
      console.log('%c✓ Detected multi-admin format', 'color: #4CAF50; font-weight: bold;');
      for (const [key, creds] of Object.entries(adminData)) {
        console.log(`  Checking: ${key}`, creds);
        if (creds && typeof creds === 'object' && creds.email && creds.password) {
          console.log(`    → Email in DB: "${creds.email}", Provided: "${email}"`);
          console.log(`    → Password match: ${creds.password === password}`);
          if (creds.email === email && creds.password === password) {
            isValid = true;
            matchedAdmin = key;
            console.log(`    ✅ MATCHED AT: ${key}`);
            break;
          }
        }
      }
    }
    // Handle legacy format: single admin at root level
    else if (adminData.email && adminData.password) {
      console.log('%c✓ Detected legacy single-admin format', 'color: #FF9800; font-weight: bold;');
      isValid = email === adminData.email && password === adminData.password;
      matchedAdmin = 'default';
    }

    console.log(
      '%c🔍 Validating admin credentials',
      'background: #673AB7; color: white; padding: 3px 6px; border-radius: 3px; font-weight: bold;',
      {
        providedEmail: email,
        parsedPassword: password.replace(/./g, '*'),
        isValid: isValid,
        matchedAdmin: matchedAdmin,
        timestamp: new Date().toISOString()
      }
    );
    
    if (!isValid) {
      console.error(
        '%c❌ [ADMIN AUTH FAILED]',
        'background: #f44336; color: white; padding: 3px 6px; border-radius: 3px; font-weight: bold;',
        {
          timestamp: new Date().toISOString(),
          message: 'Invalid admin credentials',
          providedEmail: email,
          providedPassword: password.replace(/./g, '*'),
          failureReason: 'Email or password mismatch'
        }
      );
    } else {
      console.log(
        '%c✅ [ADMIN AUTH SUCCESS]',
        'background: #4CAF50; color: white; padding: 3px 6px; border-radius: 3px; font-weight: bold;',
        {
          timestamp: new Date().toISOString(),
          message: 'Admin authenticated successfully',
          email: email
        }
      );
    }
    
    return isValid;
  } catch (err) {
    console.error(
      '%c❌ Error validating admin credentials:',
      'background: #f44336; color: white; padding: 3px 6px; border-radius: 3px; font-weight: bold;',
      err
    );
    return false;
  }
};

/**
 * Check if user is admin based on their profile
 * @param {object} userProfile - User profile from database
 * @returns {boolean} True if user is admin
 */
export const isUserAdmin = (userProfile) => {
  return userProfile && userProfile.role === 'admin';
};

/**
 * Mark user as admin in their profile
 * @param {object} profile - User profile object
 * @returns {object} Updated profile with admin role
 */
export const markAsAdmin = (profile) => {
  return {
    ...profile,
    role: 'admin',
    adminVerifiedAt: new Date().toISOString()
  };
};

/**
 * Detailed error reporter for admin access attempts
 * @param {string} reason - Reason for access denial
 * @param {object} context - Additional context information
 */
export const reportAdminAccessDenial = (reason, context = {}) => {
  const errorReport = {
    timestamp: new Date().toISOString(),
    reason: reason,
    attemptedBy: context.userEmail || 'Unknown',
    userRole: context.userRole || 'user',
    userAuthenticated: context.isAuthenticated || false,
    referrer: document.referrer || 'Direct',
    url: window.location.href,
    userAgent: navigator.userAgent,
    ipInfo: context.ipInfo || 'Not available',
    ...context
  };

  // Group log output
  console.group(
    '%c⛔ ADMIN ACCESS DENIED',
    'background: #f44336; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; font-size: 14px;'
  );
  console.log('%cReason:', 'font-weight: bold; color: #f44336;', reason);
  console.log('%cAttempted by:', 'font-weight: bold;', context.userEmail || 'Anonymous User');
  console.log('%cUser authenticated:', 'font-weight: bold;', context.isAuthenticated ? 'Yes' : 'No');
  console.log('%cUser role:', 'font-weight: bold;', context.userRole || 'user');
  console.log('%cAttempt timestamp:', 'font-weight: bold;', errorReport.timestamp);
  console.log('%cFull error report:', 'font-weight: bold; color: #f44336;', errorReport);
  console.table({
    'Access Type': 'Admin Panel',
    'Status': 'DENIED',
    'Reason': reason,
    'User Email': context.userEmail || 'Unknown',
    'Time': new Date().toLocaleTimeString()
  });
  console.groupEnd();

  // Also log the full report as table
  console.table(errorReport);

  return errorReport;
};

/**
 * Report successful admin access
 * @param {object} context - Context information
 */
export const reportAdminAccessSuccess = (context = {}) => {
  const successReport = {
    timestamp: new Date().toISOString(),
    adminEmail: context.userEmail || 'Unknown',
    method: 'Admin Authentication',
    sessionId: generateSessionId(),
    ...context
  };

  console.group(
    '%c✅ ADMIN ACCESS GRANTED',
    'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; font-size: 14px;'
  );
  console.log('%cAdmin:', 'font-weight: bold; color: #4CAF50;', context.userEmail);
  console.log('%cAccess granted at:', 'font-weight: bold;', successReport.timestamp);
  console.log('%cSession ID:', 'font-weight: bold;', successReport.sessionId);
  console.log('%cFull success report:', 'font-weight: bold; color: #4CAF50;', successReport);
  console.table({
    'Access Type': 'Admin Panel',
    'Status': 'GRANTED',
    'Admin': context.userEmail || 'Unknown',
    'Time': new Date().toLocaleTimeString()
  });
  console.groupEnd();

  return successReport;
};

/**
 * Generate a unique session ID for tracking
 */
const generateSessionId = () => {
  return `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if admin page is being bypassed
 */
export const checkAdminPageBypass = () => {
  console.warn(
    '%c⚠️  SECURITY WARNING',
    'background: #ff9800; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
    'Direct access to admin page detected. Checking authentication...'
  );
};

/**
 * Report unauthorized access attempt (repeated failures)
 */
export const reportUnauthorizedAccessAttempt = (attemptCount, email) => {
  if (attemptCount > 2) {
    console.error(
      '%c🔒 SECURITY ALERT: REPEATED UNAUTHORIZED ACCESS',
      'background: #d32f2f; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; font-size: 14px;',
      {
        attemptCount: attemptCount,
        email: email,
        timestamp: new Date().toISOString(),
        message: `${attemptCount} failed admin access attempts detected`
      }
    );
  }
};
