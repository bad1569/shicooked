# Firebase Authentication 400 Error - Troubleshooting Guide

## What Causes the 400 Error?

The 400 error typically means "Bad Request" from Firebase. This can happen due to:

1. **Email/Password authentication not enabled**
2. **Invalid Firebase configuration**
3. **Weak password requirements not met**
4. **Email already in use**
5. **Network/CORS issues**
6. **Firebase project not properly initialized**

## Step-by-Step Solutions

### Step 1: Check Browser Console for Detailed Error

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Look for the exact error message from Firebase
4. Screenshot or note the complete error message

### Step 2: Verify Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **"alacritas-ai"** project
3. In the left menu, click **Build** → **Authentication**
4. Check that **Email/Password** provider is **ENABLED**
   - If not enabled, click "Email/Password" and toggle it **ON**

### Step 3: Check Firestore/Realtime Database Rules

1. In Firebase Console, go to **Build** → **Realtime Database**
2. Click **Rules** tab
3. Update rules to allow authentication:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "applications": {
      ".read": "auth.uid != null",
      ".write": "auth.uid != null"
    },
    "jobs": {
      ".read": true,
      ".write": "auth.uid != null && root.child('admins').child(auth.uid).exists()"
    }
  }
}
```

4. Click **Publish**

### Step 4: Clear Browser Cache & Try Again

1. Close all tabs of your app
2. Clear browser cache (Ctrl+Shift+Delete on Windows/Linux, Cmd+Shift+Delete on Mac)
3. Open the app fresh
4. Try signing up again
5. Check console for logs

### Step 5: Test with Correct Password Requirements

Firebase requires:
- **Minimum 6 characters**
- No specific complexity rules (but stronger is better)

Try signup with:
- **Email**: test@example.com
- **Password**: password123
- **Name**: Test User

### Step 6: Check for Network Issues

1. Open **Network Tab** in Developer Tools
2. Try signing up
3. Look for the request to Firebase
4. Check the response status - should be 200, not 400
5. Click on the request to see full response details

## Common Error Messages & Solutions

### "auth/operation-not-allowed"
**Problem**: Email/Password authentication is disabled
**Solution**: Enable it in Firebase Console → Authentication → Email/Password

### "auth/email-already-in-use"
**Problem**: Email is already registered
**Solution**: Use a different email or try logging in

### "auth/weak-password"
**Problem**: Password is too short (must be 6+ characters)
**Solution**: Use a longer password

### "auth/invalid-email"
**Problem**: Email format is invalid
**Solution**: Use valid email format (e.g., user@example.com)

## If Problem Persists

### Check Your Firebase Configuration

Make sure `src/config/firebase.js` has correct values:
- `apiKey`: Should start with "AIzaSy..."
- `authDomain`: Should match "*.firebaseapp.com"
- `projectId`: Should match your Firebase project

### Verify App.js Has AuthProvider

The app must wrap everything in AuthProvider:

```javascript
<AuthProvider>
  <JobsProvider>
    {/* rest of app */}
  </JobsProvider>
</AuthProvider>
```

### Check Network Request

Open DevTools → Network tab → Try signup
Look for request to:
- `identitytoolkit.googleapis.com` (newer SDK)
- `www.googleapis.com/identitytoolkit` (older SDK)

If no request is made, the issue is before Firebase is called.

## Debug Mode

Add this to your console (browser DevTools):

```javascript
// Check if Firebase is initialized
console.log('Firebase app:', window.firebase?.app?.());

// Check auth object
import { auth } from './src/config/firebase';
console.log('Auth object:', auth);
```

## Advanced Debugging

### 1. Enable Firebase Debug Logging

Add to `src/index.js` before rendering:

```javascript
import { getAuth } from 'firebase/auth';
export const auth = getAuth();

// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  firebase.auth.useDeviceLanguage();
}
```

### 2. Check Local Storage

In DevTools Console:
```javascript
localStorage.getItem('firebase:authuser:AIzaSyC2KdojXKpe_jGot76EUgIm2OvDQDEFH-g:alacritas-ai')
```

This shows if any auth state is stored.

### 3. Monitor Console Logs

Our updated AuthContext now logs:
- "Starting signup with email: [email]"
- "User created: [uid]"
- "Profile updated with displayName"
- "User profile saved to database"

Check browser console during signup attempt.

## Step-by-Step Testing

1. **Clear everything**
   - Close all browser tabs with your app
   - Clear cache (Ctrl+Shift+Delete)
   - Restart browser

2. **Open app fresh**
   - Open DevTools (F12)
   - Go to Console tab
   - Open your app homepage

3. **Click Sign Up**
   - Fill form with test data:
     - Name: Test User
     - Email: test@example.com
     - Password: password123
   - Check console for logs starting with "Attempting signup"

4. **Watch the response**
   - Network tab should show request to Google
   - Response should be 200 or similar
   - Console should show "User created: [uid]"

5. **Check all errors**
   - Any red errors in console?
   - Any yellow warnings?
   - What's the exact error message?

## Quick Checklist

- [ ] Firebase project exists at console.firebase.google.com
- [ ] Email/Password auth is ENABLED in Firebase
- [ ] Database rules updated
- [ ] Browser cache cleared
- [ ] App reloaded fresh
- [ ] Using password with 6+ characters
- [ ] Using valid email format
- [ ] Console shows "Attempting signup with email" log
- [ ] No CORS errors in console
- [ ] No network errors in Network tab

## If Still Not Working

**Provide these details:**

1. **Exact error message** from console
2. **Network tab** response details
3. **Firebase project name**
4. **Test email you're using**
5. **Test password length**
6. **Screenshot of DevTools console**

## Email/Password Enable Instructions (Detailed)

1. Go to https://console.firebase.google.com/
2. Click your "alacritas-ai" project
3. On the left, find "Build" section
4. Click "Authentication"
5. You'll see different sign-in methods
6. Find "Email/Password"
7. Click on it
8. Toggle the switch to **ON** (should turn blue)
9. A dialog may appear - confirm
10. Click **Save**
11. Wait for it to update
12. Refresh your app and try signup

## Port & localhost Issues

If running locally (http://localhost:3000):

1. Go to Firebase Console
2. Project Settings (gear icon)
3. Scroll down to "Web apps"
4. Under "Domain whitelist", add:
   - `localhost:3000`
   - Your deployed domain (if applicable)

## Still Stuck?

1. Check the [Firebase JavaScript SDK docs](https://firebase.google.com/docs/auth/where-to-start)
2. Verify [Email/Password Authentication Setup](https://firebase.google.com/docs/auth/web/password-auth)
3. Review [Error Codes](https://firebase.google.com/docs/auth/admin/start#error-handling)

The logs we added to AuthContext will show exactly where the error occurs!
