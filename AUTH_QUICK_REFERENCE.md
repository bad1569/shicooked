# Authentication & Applications - Quick Reference

## Signup Flow

```
User clicks "Sign Up"
    ↓
SignupModal appears
    ↓
User fills: displayName, email, password, confirmPassword, terms
    ↓
Validation checks:
  - All fields filled
  - Valid email
  - Password ≥ 6 chars
  - Passwords match
  - Terms accepted
    ↓
Firebase creates user account
    ↓
User profile saved to /users/{uid}
    ↓
Success message
    ↓
Redirected to home (logged in)
```

## Login Flow

```
User clicks "Sign In"
    ↓
Enters email & password
    ↓
Validation checks:
  - Email and password filled
  - Valid email format
    ↓
Firebase authenticates
    ↓
User data loaded from database
    ↓
Redirected to home (logged in)
    ↓
User name shows in header
```

## Application Flow

```
User views job details
    ↓
Clicks "Apply Now"
    ↓
Check: Is user logged in?
  NO → Show login prompt
  YES → Continue
    ↓
Check: Already applied?
  YES → Show "Already applied" message
  NO → Continue
    ↓
Application modal opens
    ↓
Form pre-fills:
  - fullName (from userProfile.displayName)
  - email (from userProfile.email)
    ↓
User fills required fields:
  - phone
  - age
  - location
  - experience
  - skills
    ↓
User uploads files:
  - resume (required)
  - certificate (optional)
    ↓
User adds message (optional)
    ↓
Validations:
  - All required fields
  - Valid phone format
  - Age 18-100
  - Valid file types
  - File size < 5MB
    ↓
SUBMIT
    ↓
Upload files to Storage → Get URLs
    ↓
Save application to database
    ↓
Save to user's applications list
    ↓
Success message
    ↓
Modal closes
```

## Key Functions

### Authentication

```javascript
// In any component
import { useAuth } from '../context/AuthContext';

const { 
  currentUser,      // Firebase user object
  userProfile,      // { displayName, email, uid, ... }
  login,            // async (email, password)
  signup,           // async (email, password, displayName)
  logout,           // async ()
  loading,          // boolean
  error             // string or null
} = useAuth();

// Example usage
const handleLogin = async (email, password) => {
  try {
    await login(email, password);
    // User is now logged in
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Applications

```javascript
import {
  submitJobApplication,
  uploadApplicationFile,
  getUserApplications,
  getJobApplications,
  hasUserApplied,
  updateApplicationStatus
} from '../services/applicationService';

// Check if user applied for job
const applied = await hasUserApplied(userId, jobId);

// Get user's applications
const userApps = await getUserApplications(userId);

// Get applications for a job (admin)
const jobApps = await getJobApplications(jobId);

// Update application status (admin)
await updateApplicationStatus(jobId, appId, 'accepted');
```

## Header Display

```javascript
// When logged in, header shows:
<li>Welcome, {userProfile?.displayName}</li>
<button>Logout</button>

// When not logged in, header shows:
<button>Sign Up</button>
<Link>Sign In</Link>
```

## Database Paths

```
users/
  {uid}/
    displayName: "John Doe"
    email: "john@example.com"
    applications/
      {appId}/
        jobId: "{jobId}"
        status: "pending"

applications/
  {jobId}/
    {appId}/
      userId: "{uid}"
      fullName: "John Doe"
      status: "pending"
      resumeURL: "gs://..."
```

## File Storage Paths

```
applications/{userId}/{jobId}/resume/{filename}
applications/{userId}/{jobId}/certificate/{filename}
```

## Form Fields

### Signup Form
- displayName (required)
- email (required, valid email)
- password (required, ≥6 chars)
- confirmPassword (required, match password)
- terms (required checkbox)

### Login Form
- email (required, valid email)
- password (required)

### Application Form
**Required:**
- fullName
- email
- phone (valid format)
- age (18-100)
- location
- experience (years)
- skills (comma-separated)
- resume (file)

**Optional:**
- certificate (file)
- linkedinProfile (URL)
- portfolio (URL)
- message (textarea)

## Error Handling

```javascript
// Signup errors
- "Email already in use"
- "Password too weak"
- "Invalid email"
- "All fields required"

// Login errors
- "user-not-found"
- "wrong-password"
- "invalid-email"
- "All fields required"

// Application errors
- "Please log in to apply"
- "All required fields"
- "Invalid phone number"
- "File size must be < 5MB"
- "Please upload PDF or image"
- "You already applied for this job"
```

## File Upload Limits

- **Accepted formats**: PDF, JPG, JPEG, PNG
- **Maximum size**: 5MB per file
- **Resume**: Required
- **Certificate**: Optional

## Application Status

- **pending** - Submitted, awaiting review
- **reviewed** - Viewed by recruiter
- **accepted** - Selected for next round
- **rejected** - Not selected
- **interview** - Scheduled interview

## Testing Users (Create for Testing)

Email: john.doe@example.com
Password: password123
Name: John Doe

Email: jane.smith@example.com
Password: password456
Name: Jane Smith

## Common Issues & Solutions

### Application Modal doesn't open
- Verify currentUser exists
- Check browser console for errors
- Ensure JobApplicationModal imported

### Files not uploading
- Check file type (must be PDF/JPG/PNG)
- Check file size (must be < 5MB)
- Verify Firebase Storage rules allow writes

### User name not showing in header
- Check userProfile is populated
- Verify /users/{uid} database path exists
- Refresh page if just signed up

### Cannot apply twice - not working
- Check hasUserApplied function
- Verify /users/{uid}/applications path written
- Clear browser cache

### Firebase errors in console
- "auth/too-many-requests" - Too many login attempts (wait a bit)
- "auth/invalid-email" - Invalid email format
- "storage/object-not-found" - File deleted from storage
- "database/permission-denied" - Check Firebase rules

## Performance Tips

1. Load user profile once in AuthContext (already done)
2. Cache hasUserApplied result temporarily
3. Lazy load application modal
4. Compress images before upload
5. Use CDN for resume downloads

## Security Notes

✓ Passwords hashed by Firebase
✓ Auth tokens managed by Firebase SDK
✓ User can only see/edit own data
✓ File storage path includes user ID
✓ Consider rate limiting for applications
