# Cloudinary Setup Guide for Job Application File Uploads

This guide explains how to set up Cloudinary for uploading resume, TESDA certificates, and achievement files in your Alacritas job application system.

## What is Cloudinary?

Cloudinary is a cloud-based image and video management service that provides:
- Secure file uploads
- Automatic optimization
- CDN distribution for fast delivery
- Easy file deletion and management
- Generous free tier (25GB storage, 25M transformations/month)

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Click "Sign Up"
3. Create a free account (no credit card required for free tier)
4. Verify your email

## Step 2: Get Your Credentials

1. After logging in, you'll see the **Dashboard**
2. At the top, you'll see your **Cloud Name** - copy this
3. Look for the **Upload Preset** section (you may need to create one)

### Creating an Upload Preset (if needed):

1. Go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set:
   - **Name**: `alacritas_applications` (or any name you prefer)
   - **Unsigned**: Toggle ON (for unsigned uploads - no backend signature needed)
   - **Folder**: `alacritas/applications/` (automatic folder organization)
5. Click **Save**
6. Copy the preset name

### Getting the API Key (optional for delete function):

1. Go to **Settings** → **Developer**
2. You'll see your **API Key** at the top
3. Copy this (you may need it for file deletion features in the future)

## Step 3: Add Credentials to Your Project

1. Create or update the `.env` file in your `alacritas/` directory:

```bash
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=alacritas_applications
REACT_APP_CLOUDINARY_API_KEY=your_api_key
```

**Replace:**
- `your_cloud_name` with your actual cloud name
- `alacritas_applications` with your upload preset name
- `your_api_key` with your API key (optional)

2. Save the `.env` file

3. Restart your development server:
```bash
npm start
```

## Step 4: How It Works

### User uploads a file:
1. User selects resume/certificate/achievement file in job application form
2. File is sent to Cloudinary (not your server)
3. Cloudinary returns a secure URL
4. URL is saved in Firebase database
5. Admin can view and download files anytime

### File Upload Folder Structure on Cloudinary:
```
alacritas/applications/
├── resume/           (Resume/CV files)
├── certificate/      (TESDA Certificate files)
└── achievements/     (Achievement/Award files)
```

### Security Features:
- **Unsigned uploads**: Users can upload without exposing API secret
- **Folder organization**: Files automatically organized by type
- **File size limit**: Max 5MB per file (enforced by form)
- **File types**: Only PDF and images (JPG, PNG) allowed
- **Tags**: Files tagged with `alacritas`, `resume/certificate/achievements`, `application`

## Step 5: Testing the Upload

1. Register as a user on your platform
2. Search for a job
3. Click "Apply"
4. Fill out the application form
5. Select a resume file and submit
6. If successful, you should see:
   - Success message on the form
   - File uploaded to your Cloudinary dashboard
   - File link stored in Firebase

## Step 6: Viewing Uploaded Files

### As an Admin:
1. Log in to Admin Panel
2. Go to "Job Applications" tab
3. Filter by job category
4. Click on an application to expand it
5. Click download buttons for:
   - 📄 Download Resume
   - 📋 Download Certificate
   - 🏆 Download Achievements

### In Cloudinary Dashboard:
1. Go to [https://cloudinary.com/console](https://cloudinary.com/console)
2. Click **Media Library**
3. Files are organized in folders:
   - `alacritas/applications/resume/`
   - `alacritas/applications/certificate/`
   - `alacritas/applications/achievements/`

## Troubleshooting

### "Cloudinary is not configured" error:
- **Cause**: Environment variables not set
- **Fix**: Check `.env` file has correct `REACT_APP_CLOUDINARY_CLOUD_NAME` and `REACT_APP_CLOUDINARY_UPLOAD_PRESET`
- **Note**: Restart your server after updating `.env`

### File upload fails silently:
- **Check**: File size is under 5MB
- **Check**: File format is PDF, JPG, or PNG
- **Check**: Upload preset is set to "Unsigned"
- **Check**: Internet connection is stable

### Files not appearing in Cloudinary:
- **Check**: Upload completed without errors (check browser console)
- **Check**: Cloudinary upload preset is correctly configured
- **Verify**: Go to Cloudinary dashboard → Media Library

### "Upload preset not found" error:
- **Fix**: Create a new unsigned upload preset in Cloudinary settings
- **Verify**: Preset name matches exactly in `.env`

## Security Best Practices

1. **Keep upload preset name private** (it's not sensitive since it's unsigned)
2. **Keep API key private** (add to `.env.local`, not in version control)
3. **Enable CORS** in Cloudinary settings if needed
4. **Set up resource limit** for your free tier usage
5. **Monitor upload activity** regularly

## Free Tier Limits

- **Storage**: 25 GB
- **Monthly transformations**: 25 million
- **API requests**: 400/hour
- **Bandwidth**: 1 GB/hour

For more information, visit [Cloudinary Pricing](https://cloudinary.com/pricing)

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [JavaScript SDK Guide](https://cloudinary.com/documentation/js_integration)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)
