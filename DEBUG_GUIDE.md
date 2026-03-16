# Firebase 400 Error - Quick Debug Guide

## 🚀 Quick Start Debugging

### Step 1: Enable Console Logging
Your app now has **built-in debugging tools**. Open your browser's Developer Tools:

**Windows/Linux**: `F12` or `Ctrl+Shift+I`  
**Mac**: `Cmd+Option+I`

### Step 2: Try Signup & Watch Console

1. Open the **Console** tab
2. Click **Sign Up** button on your app
3. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click **Sign Up** button
5. **Watch the console** for logs

### Step 3: Interpret the Logs

You should see logs like:
```
[AUTH] SIGNUP_ATTEMPT
[AUTH] USER_CREATED ...
[AUTH] PROFILE_UPDATED ...
[DATABASE] SAVE_PROFILE users/[uid] ...
[AUTH] SIGNUP_SUCCESS ...
```

**If signup fails**, you'll see:
```
[ERROR] Firebase Error [auth/operation-not-allowed]: ...
```

---

## 🔧 Advanced Debugging

### Check All Debug Info in Console

Type this in your browser console:

```javascript
window.firebaseDebugger.printSummary()
```

Output shows:
- Total logs
- Auth logs count
- Error count
- Network requests

### Get Detailed Error Info

```javascript
window.firebaseDebugger.getLogsByCategory('ERROR')
```

Shows all errors with details:
- Error code (e.g., `auth/operation-not-allowed`)
- Error message
- Timestamp

### Auto-Diagnose Issues

```javascript
window.firebaseDebugger.diagnoseIssues()
```

Automatically checks for:
- ✅ Email/Password auth enabled?
- ✅ Weak password?
- ✅ Email already in use?
- ✅ Too many failed attempts?

---

## 📋 Common Error Codes & Fixes

### `auth/operation-not-allowed`
**Problem**: Email/Password authentication is disabled  
**How to fix**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **alacritas-ai** project
3. Click **Build** → **Authentication**
4. Click **Email/Password** provider
5. Turn the **toggle ON** (blue)
6. Click **Save**
7. Refresh your app and try again

### `auth/email-already-in-use`
**Problem**: Email address already registered  
**How to fix**: Use a different email address

### `auth/weak-password`
**Problem**: Password is less than 6 characters  
**How to fix**: Use a password with at least 6 characters

### `auth/invalid-email`
**Problem**: Email format is invalid  
**How to fix**: Use proper email format (e.g., user@example.com)

### `NETWORK Error` or No Logs at All
**Problem**: Request isn't reaching Firebase   
**How to fix**:
1. Check your internet connection
2. Check Firebase API key in `src/config/firebase.js`
3. Check `authDomain` matches your Firebase project

---

## 🔍 Step-by-Step Troubleshooting

### Test 1: Check if Debugger is Working
Open console and type:
```javascript
window.firebaseDebugger
```

You should see an object with methods. If not, there's an import issue.

### Test 2: Check Firebase Config
```javascript
import { auth, db } from './src/config/firebase';
console.log('Auth:', auth);
console.log('DB:', db);
```

Both should show Firebase objects, not undefined.

### Test 3: Clear Everything & Start Fresh
1. Close all browser tabs with your app
2. Clear browser cache: `Ctrl+Shift+Delete`
3. Close browser completely
4. Reopen browser
5. Go to your app fresh
6. Try signup again
7. Check console logs

### Test 4: Check Network Tab
1. Open DevTools → **Network** tab
2. Try signing up
3. Look for request to `identitytoolkit.googleapis.com` or similar
4. Check the **Response** tab of that request
5. Look for error message in response

---

## 📊 Export Debug Logs

If you want to send logs to someone for help:

```javascript
copy(window.firebaseDebugger.exportLogs())
```

Then paste in Slack, Discord, or email.

---

## ✅ Pre-Flight Checklist

Before submitting bug report, verify:

- [ ] Email/Password auth is **ENABLED** in Firebase Console
- [ ] Using valid email format (user@example.com)
- [ ] Password has at least 6 characters
- [ ] Browser cache cleared
- [ ] App reloaded fresh (not cached)
- [ ] No "auth/operation-not-allowed" error
- [ ] Internet connection working
- [ ] Firebase project correct in config

---

## 🆘 Still Stuck?

**Collect this information**:

```javascript
// In browser console, run these:

// 1. Get all errors
window.firebaseDebugger.getLogsByCategory('ERROR')

// 2. Get summary
window.firebaseDebugger.printSummary()

// 3. Auto-diagnose
window.firebaseDebugger.diagnoseIssues()

// 4. Export all logs
copy(window.firebaseDebugger.exportLogs())
```

**Then share**:
1. Screenshots of the error in console
2. The exported logs
3. Which step failed (User created? Profile updated? etc.)
4. Your Firebase project name

---

## 📱 Browser DevTools Tips

### View Console Logs
- **Windows/Linux**: F12 → Console tab
- **Mac**: Cmd+Option+I → Console tab
- Look for logs starting with `[AUTH]`, `[ERROR]`, `[DATABASE]`

### Search Console Logs
- Press `Ctrl+F` in console
- Search for "ERROR" to find failures
- Search for "SIGNUP_ATTEMPT" to see signup process

### Clear Console
- Right-click in console → "Clear console"
- Or type: `clear()`

### Pause on Error
- Click the ⏸️ icon at top of DevTools
- App will pause when error occurs
- Shows exact line where error happens

---

## 🎯 What to Do Next

1. **Open Browser Console** (F12)
2. **Try to Sign Up** with: test@example.com / password123
3. **Check Console Logs** - what do you see?
4. **Run Diagnosis**: `window.firebaseDebugger.diagnoseIssues()`
5. **Report the error code** shown in console

The detailed logs will tell us exactly what's wrong! 🔍
