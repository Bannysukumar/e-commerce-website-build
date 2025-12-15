# Firebase Storage Setup Instructions

## Problem
You're getting a `403 Unauthorized` error when trying to upload files because Firebase Storage security rules are blocking the uploads.

## Solution
You need to update your Firebase Storage security rules to allow authenticated users to upload files.

## Steps to Fix

### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ecommerce-website-6aa12`
3. Click on **Storage** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the following:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Match all files in any path
    match /{allPaths=**} {
      // Allow read access to all authenticated users
      allow read: if request.auth != null;
      
      // Allow write access (upload, update, delete) to authenticated users
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024  // 10MB file size limit
                   && request.resource.contentType.matches('image/.*|video/.*');  // Only images and videos
    }
    
    // More specific rules for organized folders
    match /products/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    match /carousel/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    match /featured/{fileId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 50 * 1024 * 1024  // 50MB for videos
                   && request.resource.contentType.matches('image/.*|video/.*');
    }
    
    match /videos/{videoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 50 * 1024 * 1024  // 50MB for videos
                   && request.resource.contentType.matches('video/.*');
    }
    
    match /images/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

6. Click **Publish** to save the rules

### Option 2: Using Firebase CLI

If you have Firebase CLI installed:

1. Make sure you're logged in:
   ```bash
   firebase login
   ```

2. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init storage
   ```

3. The `storage.rules` file has been created in your project root. Deploy it:
   ```bash
   firebase deploy --only storage
   ```

## Important Notes

- **Authentication Required**: These rules require users to be authenticated (logged in) to upload files
- **File Size Limits**: 
  - Images: 10MB max
  - Videos: 50MB max
- **File Type Restrictions**: Only images and videos are allowed
- **Security**: These rules allow any authenticated user to upload. For production, you may want to add admin role checks

## Testing

After updating the rules:
1. Make sure you're logged in as an admin
2. Try uploading an image/video again
3. The upload should now work without the 403 error

## Troubleshooting

If you still get errors:
1. Verify you're logged in: Check the browser console for authentication status
2. Check Firebase Console → Storage → Rules to ensure rules were saved
3. Wait a few seconds after publishing rules (they may take a moment to propagate)
4. Clear browser cache and try again

