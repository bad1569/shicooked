# Firebase Configuration Checklist

## ✅ Your Firebase Project Setup

This is a checklist to ensure your Firebase project is properly configured to support the Alacritas AI app.

---

## 🔐 Authentication Setup

### 1. Enable Email/Password Authentication

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **alacritas-ai**
3. Left menu → **Build** → **Authentication**
4. You should see a **Sign-in method** tab
5. Click on **Email/Password** option
6. Toggle the switch to **ON** (should turn blue)
7. Click **Save**

**Status**: _____________ (✅ Enabled / ❌ Disabled)

### 2. Verify Authentication Methods

In Authentication page, you should see:
- ✅ Email/Password (ENABLED)
- [ ] Anonymous (optional)
- [ ] Google (optional - if you want it)

**Enabled Methods**: _________________________

---

## 📊 Realtime Database Setup

### 1. Create Realtime Database

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **alacritas-ai**
3. Left menu → **Build** → **Realtime Database**
4. Click **Create Database**
5. If asked for location, select: **asia-southeast1** (or closest to you)
6. Choose **Start in test mode**
7. Click **Enable**

**Status**: _____________ (✅ Created / ❌ Not Created)

### 2. Update Database Rules

**Steps:**
1. In Realtime Database page, click **Rules** tab
2. Replace all content with this:

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
      ".write": "auth.uid != null"
    }
  }
}
```

3. Click **Publish**

**Status**: _____________ (✅ Updated / ❌ Not Updated)

---

## 🗂️ Storage Setup (For File Uploads)

### 1. Create Firebase Storage Bucket

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **alacritas-ai**
3. Left menu → **Build** → **Storage**
4. Click **Get Started**
5. Accept terms and click **Next**
6. Choose default location (should auto-select closest)
7. Click **Done**

**Status**: _____________ (✅ Created / ❌ Not Created)

### 2. Update Storage Rules

**Steps:**
1. In Storage page, click **Rules** tab
2. Replace all content with this:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /applications/{userId}/{jobId}/{allPaths=**} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

3. Click **Publish**

**Status**: _____________ (✅ Updated / ❌ Not Updated)

---

## 🔑 Firebase Config Verification

### 1. Check Your Config File

Open: `src/config/firebase.js`

Verify you have:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // ✅ Starts with "AIzaSy"
  authDomain: "alacritas-ai.firebaseapp.com",
  projectId: "alacritas-ai",
  storageBucket: "alacritas-ai.appspot.com",
  messagingSenderId: "...",
  appId: "1:...:web:..."
};

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
```

**All values present?**: _____________ (✅ Yes / ❌ No)

**Auth exported?**: _____________ (✅ Yes / ❌ No)

**Database exported?**: _____________ (✅ Yes / ❌ No)

**Storage exported?**: _____________ (✅ Yes / ❌ No)

---

## 🔗 API Keys Setup (Optional - if signup fails)

### Check API Key Restrictions

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Project Settings** (gear icon) → **Settings**
3. Click **Service Accounts** tab
4. Click **Database Secrets** tab (or scroll down)
5. You should see your API key(s)

**Alternative - Check Restrictions:**
1. Go to https://console.cloud.google.com/
2. Search for **API Keys**
3. Find your Firebase API key
4. Click to open
5. Check **Application restrictions** - should be set to "None" or "Web applications"

**Restrictions**: _____________ (✅ No restrictions / ❌ Restricted)

---

## 📱 Web App Registration

### Verify Web App is Registered

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **alacritas-ai** project
3. Click **Project Settings** (gear icon)
4. Go to **Your apps** section
5. You should see your web app registered (with name like **alacritas-ai**)
6. If not registered, click **Add app** and select **Web**

**Web app registered?**: _____________ (✅ Yes / ❌ No)

**App name**: _________________________________

---

## 🧪 Quick Test

### Test 1: Check if Auth Works

**In Browser Console** (F12), run:

```javascript
import { auth } from './src/config/firebase';
console.log('Auth:', auth);
```

**Result**: Should show Firebase auth object (not undefined or error)

**Result**: _________________________________

### Test 2: Try Signup

**Steps:**
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Click **Sign Up** on your app
4. Fill form: test@example.com / password123 / Test User
5. **Watch console** for logs

**Expected Logs** (in order):
- `[AUTH] SIGNUP_ATTEMPT`
- `[AUTH] USER_CREATED`
- `[AUTH] PROFILE_UPDATED`
- `[DATABASE] SAVE_PROFILE`
- `[AUTH] SIGNUP_SUCCESS`

**What you see**: _________________________________

### Test 3: Check for Errors

**In Console**, run:

```javascript
window.firebaseDebugger.getLogsByCategory('ERROR')
```

**Results**:
- ✅ No errors (Empty array `[]`)
- ❌ Errors found (List Firebase error codes)

**Errors found**: _________________________________

---

## 🚨 If Signup Fails

### Run Diagnosis

**In Console**, run:

```javascript
window.firebaseDebugger.diagnoseIssues()
```

This will automatically check:
- Is Email/Password auth enabled?
- Is password strong enough?
- Are there configuration issues?

**Diagnosis Result**: _________________________________

### Collect Debug Info

If still failing, collect:

```javascript
// Get all debug info
window.firebaseDebugger.printSummary()

// Get detailed error info
console.table(window.firebaseDebugger.getLogsByCategory('ERROR'))

// Export all logs
copy(window.firebaseDebugger.exportLogs())
// Then share in Discord/Slack
```

---

## 📋 Final Verification Checklist

Before considering setup complete:

- [ ] Email/Password authentication is **ENABLED** in Firebase
- [ ] Realtime Database is **CREATED** in asia-southeast1
- [ ] Database **Rules** are updated
- [ ] Firebase Storage is **CREATED**
- [ ] Storage **Rules** are updated
- [ ] `src/config/firebase.js` has all correct values
- [ ] `auth`, `db`, and `storage` are properly exported
- [ ] Browser console shows debug logs when signing up
- [ ] No "auth/operation-not-allowed" errors
- [ ] Signup creates user and saves profile successfully

---

## 🎯 If Everything is Checked ✅

Your Firebase is properly configured! The app should:

1. ✅ Allow users to sign up with email/password
2. ✅ Save user profiles to Realtime Database
3. ✅ Allow users to log in
4. ✅ Show user name in header when logged in
5. ✅ Allow job applications
6. ✅ Upload resume/certificate files to Storage
7. ✅ Display debug logs in console

---

## ❌ If Something is Not Checked

Go back to that section and complete it. The section name will help you find the Firebase Console page you need.

---

## 📞 Troubleshooting

### "Email/Password not enabled" error?
→ Go to **Authentication Setup** → Step 1

### Database not saving?
→ Go to **Realtime Database Setup** → Update Rules

### File uploads not working?
→ Go to **Storage Setup** → Create & Update Rules

### "Invalid API Key" error?
→ Go to **API Keys Setup** → Check Restrictions

### Still stuck?
→ See [DEBUG_GUIDE.md](DEBUG_GUIDE.md) for advanced debugging

---

## 📚 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Email/Password Auth Setup](https://firebase.google.com/docs/auth/web/password-auth)
- [Realtime Database Rules](https://firebase.google.com/docs/database/rules)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)

---

**Last Updated**: Now  
**Project**: Alacritas AI  
**Status**: In Setup
