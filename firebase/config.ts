import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCvMgI5zTZEKhX0H9yh8-9wDLWhwS6sGJE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "food-app-bf79a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "food-app-bf79a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "food-app-bf79a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "385778712226",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:385778712226:web:bacdae9f406d822772e1fb",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-W4403C97QJ"
};

// Initialize primary Firebase app
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Helper function to create secondary Auth instance for creating manager credentials
export const getSecondaryAuth = () => {
  const secondaryAppName = "SecondaryManagerAuthApp";
  const secondaryApp = getApps().find((a) => a.name === secondaryAppName) || initializeApp(firebaseConfig, secondaryAppName);
  return getAuth(secondaryApp);
};

export default app;
