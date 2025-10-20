
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firestore: Firestore;

export const initFirebase = () => {
  if (!getApps().length) {
    firebaseApp = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    });
  } else {
    firebaseApp = getApps()[0];
  }

  firebaseAuth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firestore,
  };
};

export const getFirebase = () => {
  if (!firebaseApp) throw new Error("Firebase not initialized. Call initFirebase first.");
  return { app: firebaseApp, auth: firebaseAuth, db: firestore };
};
