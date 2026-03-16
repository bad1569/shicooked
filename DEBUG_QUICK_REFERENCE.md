# Firebase 400 Error - Quick Debug Reference

## 🚀 3-Step Debug

### Step 1: Open Console & Try Signup
- Press `F12` (open DevTools)
- Go to **Console** tab  
- Click Sign Up, fill form, submit
- **Watch the console**

### Step 2: Check Diagnosis
```javascript
window.firebaseDebugger.diagnoseIssues()
```

### Step 3: Fix Based on Error Code
See tables below

---

## 🔴 Error Codes & Fixes

| Error Code | Problem | Quick Fix |
|------------|---------|-----------|
| `auth/operation-not-allowed` | Email/Password auth disabled | See "Enable Auth" below |
| `auth/email-already-in-use` | Email already taken | Use different email |
| `auth/weak-password` | Password < 6 chars | Use longer password |
| `auth/invalid-email` | Bad email format | Check email format |
| Network error | Connection issue | Check internet |

---

## ⚡ Enable Email/Password Auth (2 mins)

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select **alacritas-ai** project
3. Click **Build** → **Authentication**
4. Find **Email/Password** option
5. Click it and toggle **ON** (turn blue)
6. Click **Save**
7. Refresh your app
8. Try signup again

---

## 🛠️ Debug Commands

```javascript
// Auto-diagnose what's wrong
window.firebaseDebugger.diagnoseIssues()

// See all operations
window.firebaseDebugger.printSummary()

// See only errors
window.firebaseDebugger.getLogsByCategory('ERROR')

// See auth operations
window.firebaseDebugger.getLogsByCategory('AUTH')

// Share logs (copy to clipboard)
copy(window.firebaseDebugger.exportLogs())

// Clear logs
window.firebaseDebugger.clearLogs()
```

---

## ✅ Success Flow

You should see logs in this order:

```
[AUTH] SIGNUP_ATTEMPT
[AUTH] USER_CREATED
[AUTH] PROFILE_UPDATED  
[DATABASE] SAVE_PROFILE users/[uid]
[AUTH] SIGNUP_SUCCESS
```

If not, it stops earlier and logs error.

---

## 🔍 Find The Problem

After failed signup, run:

```javascript
const errors = window.firebaseDebugger.getLogsByCategory('ERROR');
console.table(errors);
```

Look at the `code` and `message` fields.

---

## 📋 Before Getting Help

Have this info ready:

```javascript
// Run in console:
window.firebaseDebugger.printSummary()
window.firebaseDebugger.diagnoseIssues()
copy(window.firebaseDebugger.exportLogs())
```

Share:
1. Screenshot of diagnosis output
2. Error code (if any)
3. At which log step it stopped

---

## 🎯 Most Common Issue

**Error**: `auth/operation-not-allowed`

**Cause**: Email/Password authentication not enabled in Firebase

**Fix**: 
1. Go to Firebase Console
2. Select your project
3. Go to Authentication
4. Find Email/Password
5. Toggle it ON
6. Click Save
7. Reload app

---

## 📚 Full Guides

- Overview: [DEBUGGING_IMPROVEMENTS_SUMMARY.md](DEBUGGING_IMPROVEMENTS_SUMMARY.md)
- Detailed: [DEBUG_GUIDE.md](DEBUG_GUIDE.md)
- Setup: [FIREBASE_SETUP_CHECKLIST.md](FIREBASE_SETUP_CHECKLIST.md)
- Deep dive: [FIREBASE_400_ERROR_TROUBLESHOOTING.md](FIREBASE_400_ERROR_TROUBLESHOOTING.md)

---

## ✨ What's Available

- ✅ Full debug logging in console
- ✅ Color-coded log categories
- ✅ Auto-diagnosis function
- ✅ Error code mapping
- ✅ Log export for sharing
- ✅ User-friendly error messages

---

## 🎯 Next Steps

1. **Try signup** with DevTools open (F12)
2. **Check logs** for `[AUTH]`, `[ERROR]`, etc.
3. **Run diagnosis**: `window.firebaseDebugger.diagnoseIssues()`
4. **Fix issue** based on error code
5. **Try again**

Good luck! 🚀
