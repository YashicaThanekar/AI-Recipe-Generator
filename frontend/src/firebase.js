// Import Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace with your actual Firebase project config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDRmLIy6DgMhrI4GR38grQ5FgDB8xcdVU8",
  authDomain: "savora-d62b4.firebaseapp.com",
  projectId: "savora-d62b4",
  storageBucket: "savora-d62b4.firebasestorage.app",
  messagingSenderId: "366768962791",
  appId: "1:366768962791:web:b48d11ab4be24717fe7642",
  measurementId: "G-EQDQ7471SZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;