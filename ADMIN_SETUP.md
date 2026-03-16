<!-- ADMIN SETUP GUIDE -->

# Admin Credentials Setup Guide

## Overview
Admin credentials are now stored in Firebase Realtime Database instead of hardcoded in the application. This allows you to manage admin access without changing code.

## Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your Alacritas project
3. Navigate to **Realtime Database** from the left menu

## Step 2: Create Admin Node Structure

You need to create the following structure in your database:

```
root/
  └── admin/
      ├── email: "testadmin@gmail.com"
      └── password: "testadmin"
```

### Option A: Using Firebase Console UI

1. Click **"+ Create Database"** if you don't have one, or select existing
2. In the database tree, click the **"+"** button next to your database
3. Create a new key called **`admin`**
4. Inside the `admin` node, create two child keys:
   - **Key:** `email` → **Value:** `testadmin@gmail.com`
   - **Key:** `password` → **Value:** `testadmin`

### Option B: Using Raw JSON (Recommended)

1. Click the **three dots (...)**  next to your database name
2. Select **"Import JSON"**
3. Copy and paste this JSON:

```json
{
  "admin": {
    "email": "testadmin@gmail.com",
    "password": "testadmin"
  }
}
```

4. Click **"Import"**

## Step 3: Verify Database Structure

Your database should look like this:

```
Realtime Database
├── admin/
│   ├── email: "testadmin@gmail.com"
│   └── password: "testadmin"
├── users/
│   └── (user profiles...)
├── jobs/
│   └── (job listings...)
├── contactMessages/
│   └── (contact submissions...)
└── applications/
    └── (job applications...)
```

## Step 4: Test Admin Access

### To Enter as Admin:

1. **Go to your app** → http://localhost:3000 (or your deployed URL)
2. **Log in** with any user account
3. **Visit** → http://localhost:3000/admin
4. **You'll see a login form asking for admin credentials**
5. **Enter:**
   - Email: `testadmin@gmail.com`
   - Password: `testadmin`
6. **Click "Access Admin Panel"**
7. **You're now an admin!** ✅

### To Exit Admin:

1. Click the red **"✕ Exit Admin"** button in top-right
2. Your role is downgraded back to regular user
3. Redirects to home page

## Step 5: Change Admin Credentials (Optional)

To use different admin credentials:

1. Go to Firebase Realtime Database
2. Find the `admin` node
3. Update the `email` and `password` values
4. Save changes
5. Use the new credentials to enter as admin

## Example Database Structure (Complete)

```json
{
  "admin": {
    "email": "testadmin@gmail.com",
    "password": "testadmin"
  },
  "users": {
    "uid12345": {
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "user",
      "createdAt": "2026-03-01T..."
    }
  },
  "jobs": {
    "job001": {
      "title": "Software Engineer",
      "company": "Tech Corp",
      "location": "Manila"
    }
  },
  "contactMessages": {
    "msg001": {
      "name": "John",
      "email": "john@example.com",
      "subject": "Inquiry",
      "message": "Hello...",
      "timestamp": "2026-03-01T..."
    }
  },
  "applications": {
    "userid/jobid": {
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "phone": "09123456789"
    }
  }
}
```

## Security Rules Recommendation

For extra security, you can restrict read access to the admin node:

```json
{
  "rules": {
    "admin": {
      ".read": false,
      ".write": false
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "contactMessages": {
      ".read": false,
      ".write": true
    },
    "jobs": {
      ".read": true,
      ".write": false
    },
    "applications": {
      ".read": false,
      ".write": true
    }
  }
}
```

## Troubleshooting

### "Admin credentials not found in database"
- Make sure you created the `admin` node with `email` and `password` fields
- Check the node path is exactly: `admin/email` and `admin/password`
- Verify the values are strings, not numbers

### "Invalid admin credentials"
- Double-check the email and password exactly match what's in the database
- No extra spaces
- Check capitalization (emails are case-insensitive in most systems, but your stored value matters)

### Can't find the admin node in console
- Make sure the database was created
- Check you're in the correct project
- Try refreshing the page

## Benefits of Database-Stored Credentials

✅ **Flexible** - Change credentials without code changes
✅ **Secure** - Credentials aren't hardcoded in frontend
✅ **Multiple Admins** - Can add multiple admin accounts
✅ **Auditable** - Can log credential changes
✅ **Production Ready** - Better for scaling

---

**You're all set!** 🎉 Your admin system is now using Firebase Realtime Database credentials.
