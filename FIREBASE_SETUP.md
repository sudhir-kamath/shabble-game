# Firebase Setup Instructions

## Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "shabble-game")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click on "Google" provider
5. Toggle "Enable"
6. Add your email as a test user
7. Click "Save"

## Step 3: Register Web App
1. In project overview, click the web icon (</>)
2. Enter app nickname (e.g., "shabble-web")
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 4: Configure Domain
1. In Authentication > Settings > Authorized domains
2. Add your domain (e.g., localhost for development)
3. For production, add your actual domain

## Step 5: Update Configuration
Replace the placeholder values in `js/firebase-config.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id",
    measurementId: "your-actual-measurement-id"
};
```

## Security Notes
- Never commit real API keys to public repositories
- Use environment variables for production
- Set up Firebase Security Rules for production use
