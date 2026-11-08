import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Exact Firebase project configuration matching the public website
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAiViLGS4-qPQg7WngnECtkdRzMbZNHSbQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "city-hospital-f534f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "city-hospital-f534f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "city-hospital-f534f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "96664392162",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:96664392162:web:758e8d8f59b09efefc29bb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QKPPNKH9JL"
};

// Initialize Firebase App as singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
const makeDb = () => {
  try {
    return initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    return getFirestore(app);
  }
};
export const db = makeDb();
export const storage = getStorage(app);

export default app;
