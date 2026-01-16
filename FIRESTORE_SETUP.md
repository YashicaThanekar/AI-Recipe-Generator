# 🔥 Firebase Firestore Setup Guide

## Problem: Firestore is not storing data (only Auth works)

This happens when Firestore security rules are too restrictive or not properly configured.

## Solution: Update Firestore Security Rules

### Step 1: Open Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: **savora-d62b4**
3. Click on **Firestore Database** in the left sidebar

### Step 2: Update Security Rules

1. Click on the **Rules** tab at the top
2. Replace the existing rules with the contents of `firestore.rules` file in your project root
3. Click **Publish** to save the changes

### Step 3: Verify Firestore Database is Created

1. Go to **Firestore Database** in Firebase Console
2. If you see "Get started" or "Create database", click it
3. Choose **Start in production mode** (we have custom rules)
4. Select a Cloud Firestore location (choose closest to you)
5. Click **Enable**

### Step 4: Test the Connection

1. Make sure you're logged in to your app
2. Generate a recipe
3. Check browser console (F12) for success messages
4. Click "Save to Favorites" button
5. Check browser console for success messages
6. Go to Firebase Console > Firestore Database > Data tab
7. You should see: `users/{userId}/history` and `users/{userId}/favorites` collections

## Current Firestore Rules (Already in firestore.rules file)

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /history/{historyId} {
        allow read, create, update, delete: if request.auth != null && request.auth.uid == userId;
      }
      
      match /favorites/{favoriteId} {
        allow read, create, update, delete: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Debugging Steps

### Check Console Logs
Open browser console (F12) and look for these messages:
- ✅ "Attempting to save to history for user: {userId}"
- ✅ "Recipe saved to history successfully! Doc ID: {docId}"
- ❌ Any error messages with error codes

### Common Error Codes
- **permission-denied**: Firestore rules are blocking writes → Update rules in Firebase Console
- **not-found**: Database not initialized → Enable Firestore in Firebase Console
- **unauthenticated**: User not logged in → Make sure you're signed in

### Verify Firebase Config
Check that `frontend/src/firebase.js` has the correct config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDRmLIy6DgMhrI4GR38grQ5FgDB8xcdVU8",
  authDomain: "savora-d62b4.firebaseapp.com",
  projectId: "savora-d62b4",
  storageBucket: "savora-d62b4.firebasestorage.app",
  messagingSenderId: "366768962791",
  appId: "1:366768962791:web:b48d11ab4be24717fe7642"
};
```

## Testing Checklist

- [ ] Firestore Database is enabled in Firebase Console
- [ ] Firestore rules are updated and published
- [ ] User is logged in (check with console.log(user))
- [ ] Generate a recipe successfully
- [ ] Check browser console for "✅ Recipe saved to history successfully!"
- [ ] Click "Save to Favorites" button
- [ ] Check browser console for "✅ Recipe saved to favorites successfully!"
- [ ] Verify data in Firebase Console > Firestore Database > Data tab
- [ ] Navigate to History page and see recipes
- [ ] Navigate to Favorites page and see saved recipes

## If Still Not Working

1. **Clear browser cache and reload**
2. **Sign out and sign in again**
3. **Check browser console for specific error messages**
4. **Verify Firebase project billing is enabled** (required for Firestore)
5. **Try in incognito mode** to rule out extension conflicts

## Support

If you see specific error messages in the console, they will now be more detailed and helpful for debugging!
