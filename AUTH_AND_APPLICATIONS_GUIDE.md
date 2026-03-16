# Authentication & Job Application System Documentation

## Overview
Your Alacritas AI platform now has a fully functional authentication system using Firebase and a complete job application workflow with resume/certificate uploads.

## Features Implemented

### ✅ Firebase Authentication
- User registration with email and password
- User login with Firebase authentication
- Persistent authentication state
- Secure logout functionality
- User profile management

### ✅ Dynamic Header
- Shows user's full name when logged in
- Located in top-right corner of navigation
- Replace Login/Sign Up buttons with Logout
- Async logout handling

### ✅ Job Application System
- Complete application modal with form
- User information collection (name, age, location, email, phone)
- Professional details (experience, skills)
- File uploads (resume & certificate)
- Cover letter/message field
- Prevents duplicate applications
- Real-time file upload to Firebase Storage

### ✅ File Management
- Resume upload (PDF, JPG, PNG)
- Certificate upload (PDF, JPG, PNG)
- Maximum file size: 5MB
- Files stored securely in Firebase Storage
- Downloadable URLs for admin review

## How It Works

### User Registration

1. Click "Sign Up" button on homepage
2. Enter full name, email, password in modal
3. Accept terms and conditions
4. Click "Create Account"
5. Account created in Firebase Authentication
6. User profile saved to Firebase Database
7. Automatically redirected to homepage

```javascript
const [formData, setFormData] = useState({
  displayName: '',      // Full name
  email: '',            // Email address
  password: '',         // Password
  confirmPassword: '',  // Confirm password
  terms: false          // Term acceptance
});
```

### User Login

1. Click "Sign In" link
2. Enter email and password
3. Click "Sign In" button
4. User logged in to Firebase
5. Redirected to homepage
6. Name appears at top-right

```javascript
const [formData, setFormData] = useState({
  email: '',
  password: ''
});
```

### Job Application Process

1. User views job details
2. Clicks "Apply Now" button
3. Application modal opens
4. Fills in personal information:
   - Full Name (pre-filled from profile)
   - Email (pre-filled from profile)
   - Phone number
   - Age
   - Location

5. Fills professional details:
   - Years of experience
   - Key skills
   - LinkedIn profile (optional)
   - Portfolio website (optional)

6. Uploads documents:
   - Resume/CV (required)
   - Certificate (optional)

7. Adds cover letter (optional)
8. Submits application
9. Files uploaded to Firebase Storage
10. Application saved to Firebase Database

## Database Structure

### Users Collection
```
users/
  {uid}/
    displayName: "John Doe"
    email: "john@example.com"
    photoURL: ""
    createdAt: "2024-02-28T..."
    applications/
      {applicationId}/
        jobId: "{jobId}"
        applicationId: "{applicationId}"
        appliedAt: "2024-02-28T..."
        status: "pending"
```

### Applications Collection
```
applications/
  {jobId}/
    {applicationId}/
      applicationId: "{applicationId}"
      userId: "{uid}"
      jobId: "{jobId}"
      fullName: "John Doe"
      email: "john@example.com"
      phone: "+1-234-567-8900"
      age: "28"
      location: "Manila, Metro Manila"
      experience: "5"
      skills: ["Wiring", "Circuit Installation"]
      message: "I'm very interested..."
      resumeURL: "https://firebase-storage-url..."
      certificateURL: "https://firebase-storage-url..."
      linkedinProfile: "https://linkedin.com/..."
      portfolio: "https://portfolio.com/..."
      status: "pending" // pending, reviewed, accepted, rejected
      appliedAt: "2024-02-28T..."
      updatedAt: "2024-02-28T..."
```

## Authentication Context

The `useAuth()` hook provides:

```javascript
const {
  currentUser,          // Firebase Authentication user object
  userProfile,          // User profile from database
  loading,              // Loading state
  error,                // Error message if any
  signup,               // Async signup function
  login,                // Async login function
  logout,               // Async logout function
  updateUserProfile     // Update user profile
} = useAuth();
```

### Usage Example

```javascript
import { useAuth } from '../context/AuthContext';

export const MyComponent = () => {
  const { currentUser, userProfile, login, logout } = useAuth();

  if (!currentUser) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      Welcome, {userProfile?.displayName}!
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## Application Service

The `applicationService.js` provides functions for:

```javascript
// Upload files to Storage
uploadApplicationFile(userId, jobId, file, fileType)

// Submit application
submitJobApplication(userId, jobId, applicationData)

// Get user applications
getUserApplications(userId)

// Get job applications (for admins)
getJobApplications(jobId)

// Update application status (for admins)
updateApplicationStatus(jobId, applicationId, status)

// Check if user already applied
hasUserApplied(userId, jobId)
```

## File Storage Structure

Files are stored in Firebase Storage:

```
applications/
  {userId}/
    {jobId}/
      resume/
        {userId}_{jobId}_resume_{timestamp}_{filename}
      certificate/
        {userId}_{jobId}_certificate_{timestamp}_{filename}
```

## Workflow Validation

### Signup Validation
- ✓ All fields required
- ✓ Valid email format
- ✓ Password minimum 6 characters
- ✓ Passwords must match
- ✓ Terms & conditions required

### Login Validation
- ✓ Email required
- ✓ Valid email format
- ✓ Password required
- ✓ Firebase authentication check

### Application Validation
- ✓ User must be logged in
- ✓ All required fields
- ✓ Valid phone number format
- ✓ Valid age (18-100)
- ✓ Resume file required
- ✓ File type validation (PDF, JPG, PNG)
- ✓ File size limit (5MB)

## Security Considerations

### Current Implementation
- Passwords hashed by Firebase
- User sessions managed by Firebase
- Files uploaded to secure Firebase Storage
- Database rules should be configured (see below)

### Recommended Firebase Rules

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
      ".read": "root.child('users').child(auth.uid).exists() || auth.uid != null",
      ".write": "auth.uid != null",
      "$jobId": {
        "$appId": {
          ".read": "root.child('users').child(auth.uid).exists() || auth.uid != null"
        }
      }
    }
  }
}
```

## User Experience Flow

```
Homepage
  ↓
[Not Logged In] → Sign Up Modal → Sign In → Logged In
  ↓                                              ↓
View Jobs                                   View Jobs
  ↓                                              ↓
View Job Details                           View Job Details
  ↓                                              ↓
View Apply Button                          Apply Now Button
  ↓                                              ↓
[Prompts Login]                            Application Modal
                                                ↓
                                           Fill Form + Upload Files
                                                ↓
                                           Submit Application
                                                ↓
                                           Success Message
                                                ↓
                                           Application Saved
```

## Components & Files Modified

### New Files Created
- `src/services/applicationService.js` - Application handling
- `src/components/JobApplicationModal.js` - Application form modal
- `src/styles/applicationModal.css` - Modal styling

### Files Updated
- `src/config/firebase.js` - Added auth & storage exports
- `src/context/AuthContext.js` - Firebase-based auth
- `src/components/Header.js` - Display user name
- `src/components/SignupModal.js` - Firebase signup
- `src/pages/LoginPage.js` - Firebase login
- `src/pages/JobDetailsPage.js` - Applied application modal

## Testing Checklist

- [ ] User can sign up with valid email and password
- [ ] Signup validation works for invalid inputs
- [ ] Logged in user name appears in header
- [ ] User can log in with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] User can logout successfully
- [ ] Cannot apply without being logged in
- [ ] Application form auto-fills user data
- [ ] Cannot apply twice for same job
- [ ] File upload validation works
- [ ] Large files are rejected (>5MB)
- [ ] Invalid file types are rejected
- [ ] Application submission succeeds
- [ ] Success message appears
- [ ] Files uploaded to Firebase Storage
- [ ] Application saved to database

## Troubleshooting

### User data not showing in header
- Check if `userProfile?.displayName` is populated
- Verify database `/users/{uid}` path has data
- Check browser console for fetch errors

### File upload fails
- Verify Firebase Storage rules allow uploads
- Check file size (must be < 5MB)
- Verify file type (PDF, JPG, PNG only)
- Check Firebase Storage quota

### Application not saving
- Check Firebase Database rules
- Verify user authentication status
- Check console for error messages
- Verify database structure matches schema

### Can apply multiple times
- Check `hasUserApplied` function logic
- Verify `/users/{uid}/applications` path is being written to
- Clear browser cache and retry

## Next Steps

1. **Configure Firebase Security Rules** - Implement proper database rules
2. **Email Notifications** - Set up automatic confirmation emails
3. **Admin Dashboard** - Create interface to review applications
4. **Application Status Updates** - Notify users of application status changes
5. **User Profile Page** - Let users manage their profile and view applications
6. **Interview Scheduling** - Integration with calendar for interviews

## Support & Resources

- Firebase Authentication Docs: https://firebase.google.com/docs/auth
- Firebase Storage Docs: https://firebase.google.com/docs/storage
- Firebase Realtime Database: https://firebase.google.com/docs/database
- React Context API: https://react.dev/reference/react/useContext
