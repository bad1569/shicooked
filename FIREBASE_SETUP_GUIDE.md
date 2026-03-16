# Firebase Realtime Database Setup Guide

## Overview
Your Alacritas AI application has been updated to use Firebase Realtime Database for dynamic job management. Admins can now add, edit, and delete jobs, and these changes are immediately reflected across the application.

## Implementation Summary

### 1. **Firebase Configuration** ([src/config/firebase.js](src/config/firebase.js))
   - Added `getDatabase` import from Firebase
   - Exported `db` object for Realtime Database access
   - Database URL: `https://alacritas-ai-default-rtdb.asia-southeast1.firebasedatabase.app`

### 2. **Firebase Service Layer** ([src/services/firebaseService.js](src/services/firebaseService.js))
   - Replaced Firestore operations with Realtime Database operations
   - Implemented CRUD operations using Firebase Realtime Database methods:
     - `getJobsFromDB()` - Fetches all jobs
     - `addJobToDB()` - Adds a new job
     - `updateJobInDB()` - Updates existing job
     - `deleteJobFromDB()` - Deletes a job
     - `subscribeToJobs()` - Real-time subscription (optional)
   - Added utility functions for filtering and searching

### 3. **Jobs Context** ([src/context/JobsContext.js](src/context/JobsContext.js))
   - Added `useEffect` hook to load jobs from Firebase on component mount
   - Implemented async operations for add, update, delete
   - Added helper functions:
     - `getRecentJobs(limit)` - Returns recent jobs sorted by creation date
     - `getJobsByType(type, limit)` - Returns jobs filtered by type
   - Added `loading` and `error` states for better UX

### 4. **HomePage Jobs Display** ([src/components/JobsListing.js](src/components/JobsListing.js))
   - Updated to display 4 categories:
     - **Recent Jobs** - Latest jobs added (sorted by creation date)
     - **Fulltime Jobs** - All full-time positions
     - **Parttime Jobs** - All part-time positions
     - **Freelance Jobs** - All freelance positions
   - Tab-based filtering with active state indicator

### 5. **Jobs Page** ([src/pages/JobsPage.js](src/pages/JobsPage.js))
   - Updated to use Firebase data with search functionality
   - Uses job IDs instead of array indices
   - Added loading state and empty state messaging

### 6. **Admin Panel** ([src/pages/AdminPage.js](src/pages/AdminPage.js))
   - Full CRUD functionality:
     - **Create**: Add new jobs with form validation
     - **Read**: Display all jobs in table format
     - **Update**: Edit existing jobs
     - **Delete**: Remove jobs with confirmation
   - Features:
     - Real-time form submission feedback
     - Edit form pre-population
     - Job counting
     - Submit button states (disabled during submission)

## Database Structure

Jobs are stored in Firebase Realtime Database under the `/jobs` path:

```
jobs/
  {jobId1}/
    title: "Electrician"
    type: "Fulltime"
    rate: "PHP 800-1500/m"
    companyName: "Building Services Inc"
    location: "Makati, Metro Manila"
    vacancy: "5"
    hours: "40-50h/week"
    description: "..."
    workplace: "On-site"
    education: "Trade Certification"
    experience: "3+ years"
    skills: ["Wiring", "Circuit Installation", "Safety"]
    icon: "⚡"
    image: "/images/sourced/electrical.png"
    createdAt: "2024-02-28T10:00:00.000Z"
    updatedAt: "2024-02-28T10:00:00.000Z"
  {jobId2}/
    ...
```

## Job Types Supported

- **Fulltime** - Full-time positions
- **Parttime** - Part-time positions  
- **Freelance** - Freelance/contract work
- **Contract** - Contract positions
- **Temporary** - Temporary positions

## Usage Instructions

### For Admins - Adding/Editing/Deleting Jobs

1. Navigate to Admin Panel (`/admin`)
2. Click "+ Add New Job" button
3. Fill in the job details:
   - Title (required)
   - Company Name (required)
   - Location (required)
   - Job Type (dropdown)
   - Salary Rate (format: PHP 800-1500/m)
   - And other optional fields
4. Click "Add Job" to save
5. To edit: Click "Edit" button on job row
6. To delete: Click "Delete" button (requires confirmation)

### For Users - Viewing Jobs

#### Homepage (JobsListing Component)
- Shows 4 jobs in each category by default
- Click tabs to filter:
  - Recent Jobs
  - Fulltime Jobs
  - Parttime Jobs
  - Freelance Jobs

#### Jobs Page (`/jobs`)
- Search by job title
- View all available jobs
- Click job card to view details

#### Job Details Page
- Full job information display
- Apply button
- All job specifications

## Key Features

✅ **Real-time Updates** - Jobs update immediately across all pages
✅ **Admin Control** - Full CRUD operations for job management
✅ **Multiple Filters** - Filter by job type and search
✅ **Responsive Design** - Works on all devices
✅ **Error Handling** - User feedback for all operations
✅ **Loading States** - Indication when data is being loaded
✅ **Data Persistence** - All jobs saved to Firebase

## Firebase Rules (Recommended)

For production, update your Firebase Realtime Database rules to:

```json
{
  "rules": {
    "jobs": {
      ".read": true,
      ".write": "auth.uid != null && hasRole(root, auth.uid, 'admin')",
      "$jobId": {
        ".validate": "newData.hasChildren(['title', 'companyName', 'location'])"
      }
    },
    "contacts": {
      ".read": "auth.uid != null && hasRole(root, auth.uid, 'admin')",
      ".write": true
    }
  }
}
```

## Troubleshooting

**Jobs not loading:**
- Check Firebase connection in browser console
- Verify database URL is correct
- Ensure `/jobs` path exists in Firebase console

**Add job fails:**
- Verify all required fields are filled
- Check Firebase authentication status
- Review browser console for errors

**Can't see updates:**
- Refresh the page
- Clear browser cache
- Verify Firebase realtime updates are enabled

## Next Steps

1. Populate your Firebase database with initial jobs data
2. Set up Firebase Authentication for admin protection
3. Configure Firebase Realtime Database rules for security
4. Test all CRUD operations
5. Deploy to production

## Files Modified

- `src/config/firebase.js` - Added database export
- `src/services/firebaseService.js` - Complete rewrite for Realtime DB
- `src/context/JobsContext.js` - Added Firebase integration
- `src/pages/AdminPage.js` - Added edit/delete functionality
- `src/pages/JobsPage.js` - Updated for Firebase IDs
- `src/components/JobsListing.js` - Updated filtering logic

## Support

For any issues or questions, refer to:
- [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database)
- [React Context Documentation](https://react.dev/reference/react/useContext)
