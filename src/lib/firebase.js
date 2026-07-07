import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Support both Vite import.meta.env (primary) and standard process.env (fallback)
const getEnv = (key) => {
  if (typeof window !== "undefined" && import.meta.env) {
    return import.meta.env[key];
  }
  return typeof process !== "undefined" && process.env ? process.env[key] : undefined;
};

const firebaseConfig = {
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: getEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
};

// Check if variables are available
const isFirebaseConfigured =
  typeof window !== "undefined" &&
  Boolean(getEnv("NEXT_PUBLIC_FIREBASE_API_KEY")) &&
  Boolean(getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"));

let app;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    if (typeof window !== "undefined" && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export { app, auth, db, storage, analytics, isFirebaseConfigured };
