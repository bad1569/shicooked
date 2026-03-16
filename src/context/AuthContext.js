import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import firebaseDebugger from '../utils/firebaseDebugger';
import { isValidAdminCredentials, markAsAdmin, reportAdminAccessSuccess, reportAdminAccessDenial, initializeAdminCredentials } from '../utils/adminUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          // Fetch user profile from database
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUserProfile(snapshot.val());
          } else {
            // Create default profile if doesn't exist
            const defaultProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'User',
              photoURL: user.photoURL || '',
              createdAt: new Date().toISOString()
            };
            await set(userRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Initialize admin credentials on app load
  useEffect(() => {
    const initAdminCreds = async () => {
      try {
        await initializeAdminCredentials();
        console.log(
          '%c[SUCCESS] Admin credentials initialized on app load',
          'background: #4CAF50; color: white; padding: 3px 6px; border-radius: 3px;'
        );
      } catch (err) {
        console.error('Error initializing admin credentials:', err);
      }
    };
    
    initAdminCreds();
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      firebaseDebugger.logAuthEvent('SIGNUP_ATTEMPT', {
        email: email,
        displayName: displayName,
        passwordLength: password.length
      });
      
      console.log('Starting signup with email:', email);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      firebaseDebugger.logAuthEvent('USER_CREATED', { uid: user.uid, email: user.email });
      console.log('User created:', user.uid);

      // Update profile with display name
      await updateProfile(user, {
        displayName: displayName
      });
      firebaseDebugger.logAuthEvent('PROFILE_UPDATED', { displayName: displayName });
      console.log('Profile updated with displayName');

      // Create user profile in database
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: '',
        createdAt: new Date().toISOString()
      };

      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, userProfile);
      firebaseDebugger.logDatabaseOp('SAVE_PROFILE', `users/${user.uid}`, true);
      console.log('User profile saved to database');

      setCurrentUser(user);
      setUserProfile(userProfile);
      firebaseDebugger.logAuthEvent('SIGNUP_SUCCESS', { uid: user.uid });

      return userProfile;
    } catch (err) {
      console.error('Signup error details:', err.code, err.message);
      firebaseDebugger.logFirebaseError(err.code || 'UNKNOWN_ERROR', err.message, 'signup');
      
      // Map Firebase error codes to user-friendly messages
      let errorMessage = err.message;
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please use a different email or log in.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign up is not enabled. Please contact support.';
      } else if (err.message && err.message.includes('400')) {
        errorMessage = 'Invalid request. Please check your inputs and try again.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      firebaseDebugger.logAuthEvent('LOGIN_ATTEMPT', { email: email });
      console.log('Starting login with email:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      firebaseDebugger.logAuthEvent('USER_LOGGED_IN', { uid: user.uid, email: user.email });
      console.log('User logged in:', user.uid);

      // Fetch user profile from database
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      let userProfile = snapshot.exists() ? snapshot.val() : null;
      
      // Check if login credentials match admin credentials
      const isAdminCredentials = await isValidAdminCredentials(email, password);
      
      if (isAdminCredentials) {
        console.log(
          '%c[ADMIN] Admin credentials detected during login - promoting user to admin',
          'background: #FFD700; color: #333; padding: 5px 10px; border-radius: 3px; font-weight: bold;'
        );
        
        if (!userProfile) {
          // Create profile if doesn't exist
          userProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Admin',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            role: 'admin'
          };
        } else {
          // Update existing profile with admin role
          userProfile.role = 'admin';
        }
        
        // Save updated profile with admin role
        await set(userRef, userProfile);
        console.log(
          '%c[SUCCESS] User promoted to admin role',
          'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
          {
            email: userProfile.email,
            role: userProfile.role,
            savedToDatabase: true,
            timestamp: new Date().toISOString()
          }
        );
      } else if (userProfile) {
        // Regular login - keep existing profile
        firebaseDebugger.logDatabaseOp('FETCH_PROFILE', `users/${user.uid}`, true);
      }

      setCurrentUser(user);
      if (userProfile) {
        setUserProfile(userProfile);
      }
      firebaseDebugger.logAuthEvent('LOGIN_SUCCESS', { uid: user.uid });
      return user;
    } catch (err) {
      console.error('Login error details:', err.code, err.message);
      
      // Special handling for admin credentials when user doesn't exist
      if (err.code === 'auth/user-not-found') {
        const isAdminCredentials = await isValidAdminCredentials(email, password);
        
        if (isAdminCredentials) {
          console.log(
            '%c🔓 Admin credentials used but user not found - creating admin user',
            'background: #FFD700; color: #333; padding: 5px 10px; border-radius: 3px; font-weight: bold;'
          );
          
          try {
            // Create Firebase user with admin credentials
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update profile
            await updateProfile(user, {
              displayName: 'Admin'
            });
            
            // Create user profile in database with admin role
            const adminProfile = {
              uid: user.uid,
              email: user.email,
              displayName: 'Admin',
              photoURL: '',
              createdAt: new Date().toISOString(),
              role: 'admin'
            };
            
            const userRef = ref(db, `users/${user.uid}`);
            await set(userRef, adminProfile);
            
            setCurrentUser(user);
            setUserProfile(adminProfile);
            
            console.log(
              '%c[SUCCESS] Admin user created and logged in successfully',
              'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
              {
                email: adminProfile.email,
                role: adminProfile.role,
                uid: user.uid,
                savedToDatabase: true,
                timestamp: new Date().toISOString()
              }
            );
            
            return user;
          } catch (createErr) {
            console.error('Error creating admin user:', createErr);
            firebaseDebugger.logFirebaseError(createErr.code || 'UNKNOWN_ERROR', createErr.message, 'admin_user_creation');
            
            let errorMessage = createErr.message;
            if (createErr.code === 'auth/email-already-in-use') {
              errorMessage = 'This email is already registered. Please log in with your password.';
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      }
      
      firebaseDebugger.logFirebaseError(err.code || 'UNKNOWN_ERROR', err.message, 'login');
      
      // Map Firebase error codes to user-friendly messages
      let errorMessage = err.message;
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please check your email or sign up.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
      throw err;
    }
  };

  const logoutFromAdmin = async () => {
    try {
      setError(null);
      // Remove admin role from user profile in database
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        await set(userRef, {
          ...userProfile,
          role: 'user'
        });
        setUserProfile(prev => ({
          ...prev,
          role: 'user'
        }));
        console.log(
          '%c[SUCCESS] Logged out from admin panel',
          'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
          { email: currentUser.email, timestamp: new Date().toISOString() }
        );
      }
    } catch (err) {
      console.error('Admin logout error:', err);
      setError(err.message);
      throw err;
    }
  };

  const authenticateAsAdmin = async (email, password) => {
    try {
      setError(null);
      firebaseDebugger.logAuthEvent('ADMIN_AUTH_ATTEMPT', { email: email });
      
      // Check if user is logged in first
      if (!currentUser) {
        reportAdminAccessDenial('User not authenticated. Please log in first.', {
          userEmail: email,
          isAuthenticated: false,
          userRole: 'guest'
        });
        throw new Error('Please log in first before accessing the admin panel.');
      }

      // Validate admin credentials from Firebase database (async)
      const isValid = await isValidAdminCredentials(email, password);
      if (!isValid) {
        reportAdminAccessDenial('Invalid admin credentials', {
          userEmail: email,
          isAuthenticated: !!currentUser,
          userRole: userProfile?.role || 'user'
        });
        throw new Error('Invalid admin credentials. Please check email and password.');
      }

      // Mark current user as admin in database
      const adminProfile = markAsAdmin(userProfile);
      const userRef = ref(db, `users/${currentUser.uid}`);
      await set(userRef, adminProfile);
      
      console.log(
        '%c[ADMIN] ADMIN PROMOTED - Saving to database',
        'background: #FFD700; color: #333; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        {
          email: currentUser.email,
          adminProfile: adminProfile,
          role: adminProfile.role,
          timestamp: new Date().toISOString()
        }
      );
      
      // Update state with the new admin profile
      setUserProfile(adminProfile);
      
      // Wait a brief moment for database write to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refetch profile from database to ensure it's the latest
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const refreshedProfile = snapshot.val();
        console.log(
          '%c[SUCCESS] ADMIN PROFILE REFRESHED',
          'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
          {
            email: refreshedProfile.email,
            role: refreshedProfile.role,
            verified: true,
            timestamp: new Date().toISOString()
          }
        );
        setUserProfile(refreshedProfile);
      }
      
      reportAdminAccessSuccess({ userEmail: currentUser.email });
      firebaseDebugger.logAuthEvent('ADMIN_AUTH_SUCCESS', { uid: currentUser.uid });
      
      return adminProfile;
    } catch (err) {
      console.error('Admin authentication error:', err);
      reportAdminAccessDenial('Authentication failed: ' + err.message, {
        userEmail: email,
        isAuthenticated: !!currentUser,
        userRole: userProfile?.role || 'user'
      });
      setError(err.message);
      throw err;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      if (currentUser) {
        // Update auth profile if displayName is in updates
        if (updates.displayName || updates.photoURL) {
          await updateProfile(currentUser, {
            displayName: updates.displayName || currentUser.displayName,
            photoURL: updates.photoURL || currentUser.photoURL
          });
        }

        // Update database profile
        const userRef = ref(db, `users/${currentUser.uid}`);
        const updatedProfile = {
          ...userProfile,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await set(userRef, updatedProfile);
        setUserProfile(updatedProfile);
        return updatedProfile;
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message);
      throw err;
    }
  };

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    loading,
    error,
    signup,
    login,
    logout,
    logoutFromAdmin,
    updateUserProfile,
    authenticateAsAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
